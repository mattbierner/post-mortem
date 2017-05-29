import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as moment from 'moment'
const rwc = require('random-weighted-choice')
const randomcolor = require('randomcolor')

import { Subject, Revision } from './subject'
import Controls from "./controls";

const SPAN = 1000 * 60 * 60 * 24 * 7

const toRgb = (entry: number) =>
    [(entry & 0xff0000) >> 16, (entry & 0x00ff00) >> 8, entry & 0x0000ff]

class MarkerPlacer {

    private positions: Map<number, number>;
    private colors: Map<number, string>;

    constructor(revisions: Revision[]) {
        this.positions = new Map()
        this.colors = new Map()

        const step = 2
        const count = 12
        const table = []
        table.push({ weight: count + 1, id: 0 })
        for (let i = 1; i <= count; ++i) {
            table.push({ weight: count + 1 - i, id: i * step })
            table.push({ weight: count + 1 - i, id: -i * step })
        }

        for (const r of revisions) {
            const d = rwc(table)
            this.positions.set(r.revid, d)
            this.colors.set(r.revid, randomcolor({
                luminosity: 'light',
                hue: 'blue',
                format: 'rgba',
                alpha: 0.70
            }))
        }
    }

    getPosition(revision: Revision): number {
        return this.positions.get(revision.revid) || 0
    }

    getColor(revision: Revision): string {
        return this.colors.get(revision.revid)
    }
}

class RevisionMarker extends React.Component<{
    revision: Revision,
    isCurrent: boolean,
    positioner: MarkerPlacer
}, null> {
    render() {
        const style: any = {
            position: 'absolute',
            left: this.props.revision.delta / SPAN * 100 + '%',
            marginTop: this.props.positioner.getPosition(this.props.revision) + 'px',
            background: this.props.positioner.getColor(this.props.revision)
        }
        return <li
            className={'revision-marker ' + (this.props.isCurrent ? 'current-revision' : '')}
            style={style} />
    }
}


class TimelineScrubber extends React.Component<{ progress: number }, null> {
    render() {
        return (
            <div className="scrubber"
                style={{ position: 'absolute', top: 0, left: (this.props.progress || 0) * 100 + '%' }} />);
    }
}

class TimelineTicks extends React.Component<{ duration: number }, null> {
    componentDidMount() {
        this.drawGrid(this.props.duration);

        window.addEventListener('resize', () => {
            this.drawGrid(this.props.duration);
        }, false);
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.duration != this.props.duration) {
            this.drawGrid(nextProps.duration);
        }
    }

    private drawGrid(duration: number) {
        if (!+duration)
            return;
        const canvas: any = ReactDOM.findDOMNode(this);
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');

        context.lineWidth = 1;
        context.strokeStyle = '#444';
        this.drawTicks(context, width, height, duration, height, duration / 7, true);
        this.drawTicks(context, width, height, duration, height / 4, duration / 7 / 24);
    }

    private drawTicks(context: any, width: number, height: number, duration: number, tickHeight: number, size: number, skipFirst: boolean = false) {
        const upper = height / 2 - tickHeight / 2;
        const lower = height / 2 + tickHeight / 2;

        context.beginPath();
        const stepSize = width / (duration / size);
        for (let i = skipFirst ? stepSize : 0; i < width; i += stepSize) {
            context.moveTo(i, upper);
            context.lineTo(i, lower);
        }
        context.stroke();
    }

    render() {
        return <canvas className='timeline-ticks' />;
    }
}

interface TimelineProps {
    subject?: Subject
    currentRevision?: string

    revisionIndex: number | undefined
    onChangeRevision: (index: number | undefined) => void

    progress: number
    onDrag: (progress: number) => void
}

interface TimelineState {
    dragging: boolean;
}

export default class Timeline extends React.Component<TimelineProps, TimelineState> {
    private revisionMarkers: any[];

    private positioner?: MarkerPlacer

    constructor(props: TimelineProps) {
        super()

        this.state = {
            dragging: false
        }

        if (props.subject) {
            this.positioner = new MarkerPlacer(props.subject.revisions)

            this.updateRevisionMarkers(props.subject)
        }
    }

    componentWillReceiveProps(newProps: TimelineProps) {
        if (newProps.subject !== this.props.subject) {
            this.positioner = new MarkerPlacer(newProps.subject.revisions)
            this.updateRevisionMarkers(newProps.subject)
        }
    }

    private updateRevisionMarkers(subject: Subject): void {
        this.revisionMarkers = []
        for (const revision of subject.revisions) {
            this.revisionMarkers.push(<RevisionMarker
                revision={revision}
                isCurrent={false}
                key={revision.revid}
                positioner={this.positioner} />);
        }
    }

    private onMouseDown(event: any) {
        if (this.state.dragging)
            return;
        this.setState({ dragging: true })
        const progress = this.getProgressFromMouseEvent(event);
        this.props.onDrag(progress);
    }

    private onMouseUp(event: React.MouseEvent<Timeline>) {
        if (!this.state.dragging)
            return;
        this.setState({ dragging: false });
        const progress = this.getProgressFromMouseEvent(event);
        this.props.onDrag(progress);
    }

    private onMouseMove(event: React.MouseEvent<Timeline>) {
        if (!this.state.dragging)
            return;
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();

        const progress = this.getProgressFromMouseEvent(event);
        this.props.onDrag(progress);
    }

    private getProgressFromMouseEvent(event: React.MouseEvent<Timeline>) {
        const node = ReactDOM.findDOMNode(this).getElementsByClassName('timeline-content')[0];
        const rect = node.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1.0, (event.pageX - rect.left) / rect.width));
        return progress
    }

    render() {
        let timestamp: moment.Moment | undefined
        if (this.props.subject) {
            timestamp = this.props.subject.start.clone().add(SPAN * this.props.progress, 'millisecond')
        }

        let currentRevision: any = ''
        if (this.props.subject && !isNaN(this.props.revisionIndex)) {
            const revision = this.props.subject.revisions[this.props.revisionIndex]
            if (revision) {
                currentRevision = <RevisionMarker
                    revision={revision}
                    isCurrent={true}
                    positioner={this.positioner} />
            }
        }

        const center = timestamp
            ? <span className='timeline-time'
                data-date-long={timestamp.format('MMMM Do YYYY, h:mm:ss a')}
                data-date-short={timestamp.format('MMM D, YYYY, H:mm:ssq')} />
            : ''

        return <div className='timeline'>
            <div className='timeline-content'
                onMouseDown={this.onMouseDown.bind(this)}
                onMouseUp={this.onMouseUp.bind(this)}
                onMouseMove={this.onMouseMove.bind(this)}>
                <TimelineTicks duration={SPAN} />
                <ol>
                    {this.revisionMarkers}
                    {currentRevision}
                </ol>
                <TimelineScrubber progress={this.props.progress} />
            </div>
            <Controls
                center={center}
                subject={this.props.subject}
                revisionIndex={this.props.revisionIndex}
                onChangeRevision={this.props.onChangeRevision} />
        </div >
    }
}

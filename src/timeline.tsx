import * as React from 'react'
import * as ReactDOM from 'react-dom'
const rwc = require('random-weighted-choice')

import { Subject, Revision } from './subject'

const SPAN = 1000 * 60 * 60 * 24 * 7

class MarkerPositioner {

    private positions: Map<number, number>;

    constructor(revisions: Revision[]) {
        this.positions = new Map()

        const step = 5
        const count = 5
        const table = []
        table.push({ weight: count + 1, id: 0 })
        for (const i = 1; i <= count; ++i) {
            table.push({ weight: count + 1 - i, id: i * step })
            table.push({ weight: count + 1 - i, id: -i * step })
        }

        for (const r of revisions) {
            const d = rwc(table)
            this.positions.set(r.revid, d)
        }
    }

    get(revision: Revision) {
        return this.positions.get(revision.revid) || 0
    }
}

class RevisionMarker extends React.Component<{ revision: Revision, isCurrent: boolean, positioner: MarkerPositioner }, null> {
    render() {
        const style: any = {
            position: 'absolute',
            left: this.props.revision.delta / SPAN * 100 + '%',
            marginTop: this.props.positioner.get(this.props.revision) + 'px'
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

interface TimelineProps {
    subject?: Subject
    currentRevision?: string

    progress: number
    onDrag: (progress: number) => void
}

interface TimelineState {
    dragging: boolean;
}

export default class Timeline extends React.Component<TimelineProps, TimelineState> {
    private positioner?: MarkerPositioner;

    constructor(props: TimelineProps) {
        super()

        this.state = {
            dragging: false
        }

        if (props.subject) {
            this.positioner = new MarkerPositioner(props.subject.revisions)
        }
    }

    componentWillReceiveProps(newProps: TimelineProps) {
        if (newProps.subject !== this.props.subject) {
            this.positioner = new MarkerPositioner(newProps.subject.revisions)
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
        const revisions: any[] = [];

        if (this.props.subject) {
            for (const revision of this.props.subject.revisions) {
                revisions.push(<RevisionMarker
                    revision={revision}
                    isCurrent={revision.revid + '' === this.props.currentRevision}
                    key={revision.revid}
                    positioner={this.positioner} />);
            }
        }

        return <div
            className='timeline'
            onMouseDown={this.onMouseDown.bind(this)}
            onMouseUp={this.onMouseUp.bind(this)}
            onMouseMove={this.onMouseMove.bind(this)}>
            <div className='timeline-content'>
                <ol>{revisions}</ol>
                <TimelineScrubber progress={this.props.progress} />
            </div>
        </div>
    }
}

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Subject, { Revision } from './subject'

const SPAN = 1000 * 60 * 60 * 24 * 7

class RevisionMarker extends React.Component<{ revision: Revision, isCurrent: boolean }, null> {
    render() {
        const distrib = 20
        const style: any = {
            position: 'absolute',
            left: this.props.revision.delta / SPAN * 100 + '%',
            marginTop: Math.round(-distrib + Math.random() * (distrib * 2)) + 'px'
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
    constructor() {
        super()

        this.state = {
            dragging: false
        }
    }

    private onMouseDown(event: any) {
        if (this.state.dragging)
            return;
        this.setState({ dragging: true })
        const progress = this.getProgressFromMouseEvent(event);
        this.props.onDrag(progress);
    }

    onMouseUp(event: React.MouseEvent<Timeline>) {
        if (!this.state.dragging)
            return;
        this.setState({ dragging: false });
        const progress = this.getProgressFromMouseEvent(event);
        this.props.onDrag(progress);
    }

    onMouseMove(event: React.MouseEvent<Timeline>) {
        if (!this.state.dragging)
            return;
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();

        const progress = this.getProgressFromMouseEvent(event);
        this.props.onDrag(progress);
    }

    private getProgressFromMouseEvent(event: React.MouseEvent<Timeline>) {
        const node = ReactDOM.findDOMNode(this);
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
                    key={revision.revid} />);
            }
        }

        return <div
            className="timeline"
            onMouseDown={this.onMouseDown.bind(this)}
            onMouseUp={this.onMouseUp.bind(this)}
            onMouseMove={this.onMouseMove.bind(this)}>
            <ol>{revisions}</ol>
            <TimelineScrubber progress={this.props.progress} />
        </div>
    }
}

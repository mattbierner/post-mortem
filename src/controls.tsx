import * as React from "react"
import * as moment from 'moment'
import { Subject, Revision } from './subject'

interface ControlsProps {
    subject: Subject
    revisionIndex: number | undefined

    center: any
    onChangeRevision: (index: number | undefined) => void
}

export default class Controls extends React.Component<ControlsProps, null> {
    private onNext() {
        let next: number;
        if (isNaN(this.props.revisionIndex)) {
            next = 0
        } else {
            next = Math.min(this.props.subject.revisions.length - 1, this.props.revisionIndex + 1)
        }
        this.props.onChangeRevision(next)
    }

    private onPrevious() {
        if (this.props.revisionIndex === 0) {
            this.props.onChangeRevision(undefined)
            return
        }

        const previous = Math.max(0, this.props.revisionIndex - 1)
        this.props.onChangeRevision(previous)
    }

    private onFirst() {
        this.props.onChangeRevision(undefined)
    }

    private onLast() {
        this.props.onChangeRevision(this.props.subject.revisions.length - 1)
    }

    render() {
        const atMin = isNaN(this.props.revisionIndex)
        const atMax = this.props.subject && this.props.revisionIndex >= this.props.subject.revisions.length - 1
        return (
            <div className='controls'>
                <a title='first' className={atMin ? 'disabled' : ''} onClick={this.onFirst.bind(this)}>&laquo;</a>
                <a title='previous' className={atMin ? 'disabled' : ''} onClick={this.onPrevious.bind(this)}>&lsaquo;</a>
                <span>{this.props.center}</span>
                <a title='next' className={atMax ? 'disabled' : ''} onClick={this.onNext.bind(this)}>&rsaquo;</a>
                <a title='last' className={atMax ? 'disabled' : ''} onClick={this.onLast.bind(this)}>&raquo;</a>
            </div>
        )
    }
}


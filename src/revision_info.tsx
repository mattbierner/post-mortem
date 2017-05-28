import * as React from "react"
import * as moment from 'moment'
import { Subject, Revision } from './subject'
import Controls from "./controls";

interface PageProps {
    subject?: Subject
    revision: string
    revisionIndex: number | undefined

    onChangeRevision: (index: number | undefined) => void
}

class Duration extends React.Component<{ value: number, unit: string }, null> {
    render() {
        return <span>
            <span className='duration-value'>{pad2(this.props.value)}</span>
            <span className='duration-unit'>{this.props.unit}</span>
        </span>
    }
}

const pad2 = (num: number) => {
    const str = '' + num;
    return str.length === 1 ? ' ' + str : str;
}

export default class RevisionInfo extends React.Component<PageProps, null> {
    render() {
        if (!this.props.subject) {
            return <div></div>
        }
        const revision: Revision = this.props.subject.getRevision(this.props.revision)
        const delta = revision ? moment.duration(revision.delta) : moment.duration(0)

        return (
            <div className='revision-info'>
                <div className='duration'>
                    <Duration value={delta.days()} unit='days' />
                    <Duration value={delta.hours()} unit='hours' />
                    <Duration value={delta.minutes()} unit='mins' />
                    <Duration value={delta.seconds()} unit='secs' />
                </div>
                <span className='duration-label'>
                    {isNaN(this.props.revisionIndex) ? 'before first death edit' : 'after first death edit'}
                </span>
                <Controls
                    center=''
                    subject={this.props.subject}
                    revisionIndex={this.props.revisionIndex}
                    onChangeRevision={this.props.onChangeRevision} />
            </div>
        )
    }
}


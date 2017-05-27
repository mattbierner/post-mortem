import * as React from "react"
import * as moment from 'moment'
import { Subject, Revision } from './subject'

interface PageProps {
    subject?: Subject
    revision: string
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
        if (!this.props.subject || !this.props.revision) {
            return <div></div>
        }
        const revision: Revision = this.props.subject.getRevision(this.props.revision)
        const delta = moment.duration(revision.delta)

        return (
            <div className="revision-info">
                <div className='duration'>
                    <Duration value={delta.days()} unit='days' />
                    <Duration value={delta.hours()} unit='hours' />
                    <Duration value={delta.minutes()} unit='minutes' />
                    <Duration value={delta.seconds()} unit='seconds' />
                </div>
                <p className='duration-label'>After First Death Edit</p>
                <p>
                    {revision.comment}
                </p>
            </div>
        )
    }
}


import * as React from "react";
import styled from 'styled-components';
import Subject, { Revision } from "./subject";
import * as moment from 'moment';

interface PageProps {
    subject?: Subject;
    revision: string;
}

const Duration = styled.span`
    white-space: pre;
    font-family: monospace;
`

const DurationUnit = styled.span`
    font-weigth: bold;
    font-size: 0.6em;
    font-family: sans-serif;
`

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
                <p>{revision.timestamp.format('MMMM Do YYYY, h:mm:ss a')}</p>

                <h3>
                    <Duration>{pad2(delta.days())} <DurationUnit>days</DurationUnit> </Duration>
                    <Duration>{pad2(delta.hours())} <DurationUnit>hours</DurationUnit> </Duration>
                    <Duration>{pad2(delta.minutes())} <DurationUnit>minutes</DurationUnit> </Duration>
                    <Duration>{pad2(delta.seconds())} <DurationUnit>seconds</DurationUnit> </Duration>
                    <br />
                    After First Death Edit
                </h3>
                <p>
                    {revision.comment}
                </p>
            </div>
        )
    }
}


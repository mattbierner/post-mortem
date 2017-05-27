import * as React from "react";
import * as ReactDOM from "react-dom";
import { SubjectInfo, Subject } from "./subject";

interface SubjectInfoProps {
    subjects: SubjectInfo[]
    currentSubject?: Subject
    onChange: (name: string) => void
}

export default class SubjectSelector extends React.Component<SubjectInfoProps, null> {
    onChange(event: any) {
        this.props.onChange(event.target.value);
    }

    render() {
        const options = this.props.subjects.map(x =>
            <option key={x.name} value={x.name}>{x.name}</option>)

        return (
            <select
                value={this.props.currentSubject ? this.props.currentSubject.name : ''}
                onChange={this.onChange.bind(this)}>
                {options}
            </select>
        )
    }
}


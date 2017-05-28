import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from 'styled-components';

import Timeline from "./timeline";
import Page from "./page";
import { Subject, SubjectInfo, getSubjectInfo } from "./subject";
import RevisionInfo from "./revision_info";
import SubjectSelector from "./subject_selector";

const SPAN = 1000 * 60 * 60 * 24 * 7


const Container = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
`

interface IndexState {
    subjectInfo?: SubjectInfo[]
    subject?: Subject
    revision?: string
    progress: number
}

class Index extends React.Component<null, IndexState> {
    constructor() {
        super()

        const subjects = getSubjectInfo()

        this.state = {
            progress: 0,
            subjectInfo: subjects
        }

        this.setSubject(subjects[0].name)
    }

    private setSubject(subjectName: string): void {
        Subject.create(subjectName).then(subject => {
            this.setState({
                subject,
                revision: undefined
            })
            this.updateRevision(this.state.progress, subject)
        })
    }

    private onSelectedSubjectChanged(subjectName: string): void {
        this.setSubject(subjectName)
    }

    private onDrag(progress: number) {
        this.setState({ progress })
        this.updateRevision(progress, this.state.subject);
    }

    private updateRevision(progress: number, subject: Subject): void {
        const time = SPAN * progress
        let previous = undefined
        for (const revision of subject.revisions) {
            if (revision.delta >= time) {
                if (previous && Math.abs(revision.delta - time) < Math.abs(previous.delta - time)) {
                    this.setState({ revision: '' + revision.revid })
                } else {
                    this.setState({ revision: previous ? '' + previous.revid : undefined })
                }
                return;
            }
            previous = revision
        }

        this.setState({ revision: previous ? '' + previous.revid : undefined })
    }

    render() {
        return (
            <Container id="index">
                <header className='wrapper'>
                    <div>
                        <img className='logo' alt="Post Mortem" src='assets/logo.svg' />
                        <SubjectSelector
                            subjects={this.state.subjectInfo}
                            currentSubject={this.state.subject}
                            onChange={this.onSelectedSubjectChanged.bind(this)} />
                        <nav>
                            <a href="#">About</a>
                            <a href="#">Source</a>
                        </nav>
                    </div>
                </header>
                <article className="wrapper" style={{ flex: 1 }}>
                    <Page subject={this.state.subject} revision={this.state.revision} />
                    <RevisionInfo subject={this.state.subject} revision={this.state.revision} />
                </article>
                <Timeline
                    subject={this.state.subject}
                    progress={this.state.progress}
                    onDrag={this.onDrag.bind(this)}
                    currentRevision={this.state.revision} />
            </Container>
        )
    }
}


ReactDOM.render(
    <Index />,
    document.getElementById('content'));
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
    revisionIndex: number | undefined
    progress: number
}

class Index extends React.Component<null, IndexState> {
    constructor() {
        super()

        const subjects = getSubjectInfo()

        this.state = {
            progress: 0,
            revisionIndex: undefined,
            subjectInfo: subjects
        }

        this.setSubject(subjects[0].name)
    }

    private setSubject(subjectName: string): void {
        Subject.create(subjectName).then(subject => {
            this.setState({
                subject,
                revision: undefined,
                revisionIndex: undefined,
                progress: 0
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
        let i = 0
        for (const revision of subject.revisions) {
            if (revision.delta >= time) {
                if (previous && Math.abs(revision.delta - time) < Math.abs(previous.delta - time)) {
                    this.setState({
                        revision: '' + revision.revid,
                        revisionIndex: i
                    })
                } else {
                    this.setState({
                        revision: previous ? '' + previous.revid : undefined,
                        revisionIndex: previous && i >= 1 ? i - 1 : undefined
                    })
                }
                return;
            }
            ++i
            previous = revision
        }

        this.setState({
            revision: previous ? '' + previous.revid : undefined,
            revisionIndex: previous ? subject.revisions.length - 1 : undefined
        })
    }

    private onChangeRevision(index: number | undefined) {
        if (isNaN(index)) {
            this.setState({
                revision: undefined,
                progress: 0,
                revisionIndex: undefined
            })
            return
        }

        const revision = this.state.subject.revisions[index]
        this.setState({
            revision: '' + revision.revid,
            revisionIndex: index,
            progress: revision.delta / SPAN
        })
    }

    render() {
        return (
            <Container id='index'>
                <div className='left-content wrapper'>
                    <header>
                        <img className='logo' alt='Post Mortem' src='assets/logo.svg' />
                        <div>
                            <nav>
                                <a href="https://github.com/mattbierner/post-mortem#about">About</a>
                                <a href="https://github.com/mattbierner/post-mortem">Source</a>
                                <a href="http://blog.mattbierner.com/post-mortem">Post</a>
                            </nav>
                            <SubjectSelector
                                subjects={this.state.subjectInfo}
                                currentSubject={this.state.subject}
                                onChange={this.onSelectedSubjectChanged.bind(this)} />

                            <RevisionInfo
                                subject={this.state.subject}
                                revision={this.state.revision}
                                revisionIndex={this.state.revisionIndex}
                                onChangeRevision={this.onChangeRevision.bind(this)} />
                        </div>
                    </header>
                </div>
                <Page subject={this.state.subject} revision={this.state.revision} />
                <Timeline
                    subject={this.state.subject}
                    revisionIndex={this.state.revisionIndex}
                    progress={this.state.progress}
                    onDrag={this.onDrag.bind(this)}
                    currentRevision={this.state.revision}
                    onChangeRevision={this.onChangeRevision.bind(this)} />
            </Container>
        )
    }
}


ReactDOM.render(
    <Index />,
    document.getElementById('content'));
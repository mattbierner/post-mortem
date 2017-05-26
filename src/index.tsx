import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from 'styled-components';

import Timeline from "./timeline";
import Page from "./page";
import Subject from "./subject";
import RevisionInfo from "./revision_info";

const SPAN = 1000 * 60 * 60 * 24 * 7


const Container = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
`

interface IndexState {
    subject?: Subject
    revision?: string
    progress: number
}

class Index extends React.Component<null, IndexState> {
    constructor() {
        super();
        this.state = {
            progress: 0
        }

        Subject.create().then(subject => {
            this.setState({
                subject,
                revision: '' + subject.revisions[0].revid
            })
            this.updateRevision(this.state.progress, subject);
        })
    }

    private onDrag(progress: number) {
        this.setState({ progress })
        this.updateRevision(progress, this.state.subject);
    }

    private updateRevision(progress: number, subject: Subject): void {
        const time = SPAN * progress
        let r = subject.revisions[0]
        for (const revision of subject.revisions) {
            if (revision.delta >= time) {
                break;
            }
            r = revision
        }
        this.setState({ revision: '' + r.revid })
    }

    render() {
        return (
            <Container id="index">
                <header>
                    <img alt="Post Mortem" src="assets/logo.svg" />
                    <select>
                        <option value="db">David Bowie</option>
                    </select>
                </header>
                <article style={{ width: '100%', flex: 1, position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
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
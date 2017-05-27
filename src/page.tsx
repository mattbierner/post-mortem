import * as React from 'react';
import styled from 'styled-components';
import XMLHttpRequestPromise = require('xhr-promise');
import * as diff from 'diff'
import { Subject } from './subject';

const page = require('raw-loader!./page.html');



const getContent = (url: string): Promise<string> => {
    const xhr = new (XMLHttpRequestPromise as any)();
    return xhr.send({
        method: 'GET',
        url: url
    }).then((response: any) => {
        return response.responseText;
    })
}

const getBaseContent = (subject: Subject): Promise<string> =>
    getContent(`./data/content/David Bowie/${subject.base.revid}.html`);


const getDiffContent = (revision: string): Promise<string> =>
    getContent(`./data/diff/David Bowie/${revision}.diff`);


interface PageProps {
    subject?: Subject;
    revision: string;
}

interface PageState {
    pageContent?: string
}

const applyPatch = (patch: diff.IUniDiff, input: string): string => {
    //return diff.applyPatch(input, patch);
    let offset = 0
    const lines = input.split(/\n/g)
    for (const hunk of patch.hunks) {
        const removed = hunk.lines.filter(x => x && x[0] === '-')
        const toInsert = hunk.lines.filter(x => x && x[0] === '+').map(x => x.slice(1))
        lines.splice(hunk.newStart - 1, removed.length, ...toInsert);
        offset += toInsert.length - removed.length
    }
    return lines.join('\n')
}

export default class Page extends React.Component<PageProps, PageState> {
    private baseContent: Promise<string>;
    private _iframe: HTMLIFrameElement;

    constructor(props: PageProps) {
        super(props);

        this.state = {
            pageContent: undefined
        }

        if (this.props.subject) {
            this.baseContent = getBaseContent(this.props.subject);
        }

        if (props.revision) {
            this.updateRevision(props.revision);
        }
    }

    componentWillReceiveProps(newProps: PageProps) {
        if (newProps.subject !== this.props.subject) {
            this.baseContent = getBaseContent(newProps.subject);
        }

        if (newProps.revision !== this.props.revision) {
            this.updateRevision(newProps.revision);
        }
    }

    private async updateRevision(revision: string): Promise<void> {
        const base = await this.baseContent
        const patch = diff.parsePatch(await getDiffContent(revision))[0]
        if (revision === this.props.revision) {
            const r = applyPatch(patch, base);
            this._iframe.contentWindow.postMessage(r, '*');
            this.setState({ pageContent: r })
        }
    }

    render() {
        return (
            <div className='page' >
                <iframe
                    sandbox='allow-scripts allow-popups'
                    frameBorder='0'
                    width='100%' height='100%'
                    style={{ flex: 1 }}
                    srcDoc={page}
                    ref={(element: any) => { this._iframe = element; }}
                    onLoad={this.onLoad.bind(this)} />
            </div >
        )
    }

    private onLoad() {
        this._iframe.contentWindow.postMessage(this.state.pageContent, '*');
    }
}

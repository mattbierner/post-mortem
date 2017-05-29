import * as React from 'react';
import styled from 'styled-components';
import XMLHttpRequestPromise = require('xhr-promise');
import * as diff from 'diff'
import { Subject } from './subject';
import { APIROOT } from './config';


const page = require('raw-loader!./page.html');


const getContent = (url: string): Promise<string> => {
    const xhr = new (XMLHttpRequestPromise as any)();
    return xhr.send({
        method: 'GET',
        url: url
    }).then((response: any) => {
        if (response.status !== 200) {
            throw new Error('Loading error: ' + url)
        }
        return response.responseText;
    })
}

const getBaseContent = (subject: Subject): Promise<string> =>
    getContent(`${APIROOT}/data/content/${subject.name}/${subject.base.revid}.html`);


const getDiffContent = (subject: Subject, revision: string): Promise<string> =>
    getContent(`${APIROOT}/data/diff/${subject.name}/${revision}.diff`);


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

interface PageProps {
    subject?: Subject;
    revision: string | undefined;
}

interface PageState {
    pageContent?: string
    loading: boolean
}

export default class Page extends React.Component<PageProps, PageState> {
    private baseContent: Promise<string>;
    private _iframe: HTMLIFrameElement;

    constructor(props: PageProps) {
        super(props);

        this.state = {
            pageContent: undefined,
            loading: true
        }

        if (this.props.subject) {
            this.baseContent = getBaseContent(this.props.subject)
            this.updateRevision(this.props.subject, props.revision)
        }
    }

    componentWillReceiveProps(newProps: PageProps) {
        if (newProps.subject !== this.props.subject) {
            this.baseContent = getBaseContent(newProps.subject)
        }

        if (newProps.subject !== this.props.subject || newProps.revision !== this.props.revision) {
            this.updateRevision(
                newProps.subject,
                newProps.revision,
                newProps.subject !== this.props.subject)
        }
    }

    private async updateRevision(
        subject: Subject,
        revision: string | undefined,
        scrollTop: boolean = false
    ): Promise<void> {
        this.setState({ loading: true })
        const base = await this.baseContent
        if (!revision) {
            this.setState({
                pageContent: base,
                loading: false
            })
            this._iframe.contentWindow.postMessage({
                content: base,
                scrollTop: scrollTop
            }, '*')
            return
        }
        try {
            const patch = diff.parsePatch(await getDiffContent(subject, revision))[0]
            if (revision === this.props.revision) {
                const r = applyPatch(patch, base)
                this._iframe.contentWindow.postMessage({
                    content: r,
                    scrollTop: scrollTop
                }, '*')
                this.setState({
                    pageContent: r,
                    loading: false
                })
            }
        } catch (e) {
            this.setState({
                loading: false
            })
        }
    }

    render() {
        return (
            <div className='wrapper main-content' style={{ flex: 1 }}>
                <article className='page'>
                    <iframe
                        sandbox='allow-scripts allow-same-origin'
                        frameBorder='0'
                        style={{ flex: 1 }}
                        srcDoc={page}
                        ref={(element: any) => { this._iframe = element; }}
                        onLoad={this.onLoad.bind(this)} />
                    <div className='loading' style={{ display: this.state.loading ? 'block' : 'none' }}>
                        <div className='loader' />
                    </div>
                </article>
            </div>
        )
    }

    private onLoad() {
        if (this.state.pageContent) {
            this._iframe.contentWindow.postMessage({
                content: this.state.pageContent
            }, '*')
            this.setState({
                loading: false
            })
        }
    }
}

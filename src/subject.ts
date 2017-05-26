import * as moment from 'moment'

import XMLHttpRequestPromise = require('xhr-promise');

interface RevisionData {
    comment: string
    parentid: number
    parsedcomment: string
    revid: number
    timestamp: string
    user: string
}


const loadSubjectJson = (name: string): Promise<Revision[]> => {
    const xhr = new (XMLHttpRequestPromise as any)();
    return xhr.send({
        method: 'GET',
        url: `./data/revisions/${name}.json`,
    }).then((response: any) => {
        const revisions: Array<Revision> = response.responseText.map((x: RevisionData): Revision => {
            const timestamp = moment(x.timestamp)
            return {
                comment: x.comment,
                parentid: x.parentid,
                parsedcomment: x.parsedcomment,
                revid: x.revid,
                user: x.user,
                timestamp: timestamp,
                delta: 0
            }
        });

        const start = revisions[0].timestamp
        for (const revision of revisions) {
            revision.delta = revision.timestamp.diff(start);
        }

        return revisions;
    })
};


export interface Revision {
    comment: string
    parentid: number
    parsedcomment: string
    revid: number
    timestamp: moment.Moment
    delta: number
    user: string
}

export default class Subject {
    private constructor(
        private readonly _revisions: Revision[]
    ) { }

    public get revisions(): Revision[] {
        return this._revisions;
    }

    public getRevision(revisionId: string): Revision | undefined {
        return this._revisions.find(x => '' + x.revid === revisionId);
    }

    public static create(): Promise<Subject> {
        return loadSubjectJson('David Bowie')
            .then(revisions =>
                new Subject(revisions))
    }
}
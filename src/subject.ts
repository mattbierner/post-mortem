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

export class Subject {
    public readonly name: string

    private readonly _revisions: Revision[] = []
    public readonly base: Revision

    private constructor(name: string, revisions: Revision[]) {
        this.name = name

        // revision 0 is actually starting content
        // revision 1 is first death revision
        this.base = revisions[0]
        this._revisions = revisions.slice(1)

        // Set delta
        const start = this._revisions[0].timestamp
        for (const revision of this._revisions) {
            revision.delta = revision.timestamp.diff(start)
        }
    }

    public get revisions(): Revision[] {
        return this._revisions;
    }

    public getRevision(revisionId: string): Revision | undefined {
        return this._revisions.find(x => '' + x.revid === revisionId);
    }

    public static create(name: string): Promise<Subject> {
        return loadSubjectJson(name)
            .then(revisions => new Subject(name, revisions))
    }
}


export interface SubjectInfo {
    name: string
    date_of_death: string
    base_edit: number
    first_death_edit: number
}

export const getSubjectInfo = (): SubjectInfo[] => {
    return JSON.parse(require('raw-loader!../subjects.json'))
}

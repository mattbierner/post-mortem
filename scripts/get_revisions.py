import json
import argparse
from os import path
from datetime import timedelta

import revisions as revisions

SPAN = timedelta(days=7)


def get_revisions(name, base_edit, first_death_edit, outdir):
    base = revisions.get_forward_revisions(
        name,
        base_edit,
        timedelta(seconds=1))
    death_revisions = revisions.get_forward_revisions(
        name,
        first_death_edit,
        SPAN)

    data = base
    data.extend(death_revisions)
    outfilename = path.join(outdir, name + '.json')
    with open(outfilename, 'w') as outfile:
        json.dump(data, outfile,  sort_keys=True,
                  indent=2, separators=(',', ': '))
    return outfilename


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Get revisions.')
    parser.add_argument('input_file')
    parser.add_argument('outdir')

    args = parser.parse_args()

    with open(args.input_file) as data_file:
        data = json.load(data_file)

    for subject in data:
        get_revisions(
            subject['name'],
            subject['base_edit'],
            subject['first_death_edit'],
            args.outdir)

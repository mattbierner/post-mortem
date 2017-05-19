import json
import argparse
from os import path
from datetime import timedelta

import revisions as revisions


parser = argparse.ArgumentParser(description='Get revisions.')
parser.add_argument('input_file')
parser.add_argument('out_dir')

args = parser.parse_args()

span = timedelta(days=7)


with open(args.input_file) as data_file:
    data = json.load(data_file)

for subject in data:
    data = revisions.get_forward_revisions(
        subject['name'],
        subject['first_death_edit'],
        span)

    with open(path.join(args.out_dir, subject['name'] + '.json'), 'w') as outfile:
        json.dump(data, outfile,  sort_keys=True,
                  indent=2, separators=(',', ': '))

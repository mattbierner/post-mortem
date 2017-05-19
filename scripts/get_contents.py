import json
import argparse
from os import path, mkdir
from datetime import timedelta

import parse as parse


parser = argparse.ArgumentParser(description='Get revisions.')
parser.add_argument('input_file')
parser.add_argument('out_dir')

args = parser.parse_args()

span = timedelta(days=7)


with open(args.input_file) as data_file:
    data = json.load(data_file)

for subject in data:
    name = path.splitext(path.basename(args.input_file))[0]
    revid = subject['revid']
    data = parse.get_content(
        name,
        oldid=revid)

    out_dir = path.join(args.out_dir, name)
    if not path.exists(out_dir):
        mkdir(out_dir)
    with open(path.join(out_dir, str(revid) + '.html'), 'w') as outfile:
        outfile.write(data.encode('utf-8'))

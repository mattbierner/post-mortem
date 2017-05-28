from __future__ import print_function
import argparse
from os import path, mkdir
import json

import parse as parse


def get_contents(name, input_file, out_dir):
    with open(input_file) as data_file:
        data = json.load(data_file)

    for rev in data:
        revid = rev['revid']
        data = parse.get_content(name, oldid=revid)

        print('Getting Contents: {0}'.format(revid))

        if not path.exists(out_dir):
            mkdir(out_dir)

        with open(path.join(out_dir, str(revid) + '.html'), 'w') as outfile:
            outfile.write(data.encode('utf-8'))

    return out_dir


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Get contents')
    parser.add_argument('name')
    parser.add_argument('input_file')
    parser.add_argument('out_dir')

    args = parser.parse_args()

    get_contents(args.name, args.input_file, args.out_dir)

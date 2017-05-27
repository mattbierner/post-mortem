from __future__ import print_function
import argparse
from os import path, mkdir
from datetime import timedelta
import json

import parse as parse

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Get contents')
    parser.add_argument('input_file')
    parser.add_argument('out_dir')

    args = parser.parse_args()

    with open(args.input_file) as data_file:
        data = json.load(data_file)

    for rev in data:
        name = path.splitext(path.basename(args.input_file))[0]
        revid = rev['revid']
        data = parse.get_content(name, oldid=revid)

        print(revid)

        out_dir = path.join(args.out_dir, name)
        if not path.exists(out_dir):
            mkdir(out_dir)
        with open(path.join(out_dir, str(revid) + '.html'), 'w') as outfile:
            outfile.write(data.encode('utf-8'))

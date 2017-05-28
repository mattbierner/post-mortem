#!/usr/bin/env python
"""
Generate a small diff between two html documents.

Does the following:

1. Diffs two html files to add `<ins>` and `<del>` tags
2. Generates a unified diff from the html diff against the original html documents

The unified diff can be applied to the original html to generate the diff html.
"""
from __future__ import print_function
import codecs
import argparse
import re
from os import path, mkdir
from subprocess import Popen, PIPE
import tempfile
from lxml.html.diff import htmldiff
from bs4 import BeautifulSoup


def diff_html(original_content, input_file):
    """
    Generate a html diff between two html files by adding
    `<ins>` and `<del>` tags.
    """
    with codecs.open(input_file, 'r', 'utf-8') as right:
        right_content = right.read()

    content = htmldiff(
        original_content,
        right_content).encode('utf-8')

    soup = BeautifulSoup(content, 'lxml')

    # Remove link: additions
    for a in soup.findAll(['a']):
        if a.text and re.search(r'\bLink:\s.+$', a.text.encode('utf-8'), re.MULTILINE | re.UNICODE):
            a.string = re.sub(
                r'\bLink:\s.+$', u'', a.text, re.MULTILINE | re.UNICODE)

    # Remove empty tags
    for ins in soup.findAll(['ins', 'del']):
        if re.match(r'^\s*$', ins.text):
            ins.extract()

    result = []
    for element in soup.body.contents:
        if hasattr(element, 'prettify'):
            result.append(element.prettify())
        elif element and unicode(element) and not re.match(r'^\s*$', unicode(element)):
            result.append(unicode(element))

    return ''.join(result).encode('utf-8')


def generate_diff(original_content, original_file, input_file):
    """
    Generate a minimal unified diff of the html diff of the original file
    and the input file.
    """
    original_revision = path.splitext(path.basename(original_file))[0]
    input_revision = path.splitext(path.basename(input_file))[0]

    diff = diff_html(original_content, input_file)
    with tempfile.NamedTemporaryFile() as temp:
        temp.write(diff)
        temp.flush()

        process = Popen(
            ['diff', '-U 0', '--label', original_revision,
                '--label', input_revision, original_file, temp.name],
            stdout=PIPE)
        output = process.communicate()[0]
        return output.decode('utf-8')


def do_diff(basefile, input_files, out_dir):
    with codecs.open(basefile, 'r', 'utf-8') as f:
        original_content = f.read()

    if not path.exists(out_dir):
        mkdir(out_dir)

    for input_file in input_files:
        diff = generate_diff(original_content, basefile, input_file)

        out_file = path.splitext(path.basename(input_file))[0] + '.diff'
        print('Diffing: {}'.format(out_file))
        out = path.join(out_dir, out_file)
        with codecs.open(out, 'w', encoding='utf-8') as outfile:
            outfile.write(diff)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Compute diffs')
    parser.add_argument(
        '--original',
        dest='original',
        help="Html file to compare to")
    parser.add_argument(
        'input_files',
        nargs='+',
        help="Html files to diff")
    parser.add_argument(
        '--outdir',
        dest='outdir',
        help="Directory to write results to")

    args = parser.parse_args()

    do_diff(args.original, args.input_files, args.outdir)

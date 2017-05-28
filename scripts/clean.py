"""
Extracts only article contents from raw wikipedia html and formats it for better
diffing
"""
from __future__ import print_function
import codecs
import argparse
import re
from os import path, mkdir
from bs4 import BeautifulSoup, Comment


def clean(raw_content):
    """
    Extracts article contents from raw wikipedia html
    """
    soup = BeautifulSoup(raw_content, 'lxml')

    # Remove comments
    comments = soup.findAll(text=lambda text: isinstance(text, Comment))
    [comment.extract() for comment in comments]

    # Remove reference links
    for a in soup.findAll('a'):
        if re.match(r'\s*\[\d+\]\s*', a.get_text(), re.MULTILINE | re.UNICODE):
            a.extract()

    for sup in soup.findAll('sup', class_='reference'):
        sup.extract()

    # Remove edit buttons
    for span in soup.findAll('span', class_='mw-editsection'):
        span.extract()

    # Remove toc
    toc = soup.find('div', {'id': 'toc'})
    if toc:
        toc.extract()

    # Remove everything except main page content
    result = []
    start = soup.body.findChild('table')
    if start:
        start = start.find_next_sibling('p')
    else:
        start = soup.body.findChild('p')

    if not start:
        return None

    ends = []
    for id in ['Footnotes', 'References', 'Notes']:
        end = soup.find(id=id)
        if end:
            ends.append(end.parent)

    while start and not start in ends:
        if start != "\n":
            if hasattr(start, 'prettify'):
                result.append(start.prettify())
            else:
                result.append(unicode(start))
        start = start.next_sibling

    return ''.join(result)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='Extracts article contents from raw wikipedia html.')
    parser.add_argument(
        'input_files',
        nargs='+',
        help="Html files to clean")
    parser.add_argument(
        '--outdir',
        dest='outdir',
        help="Directory to write results to")

    args = parser.parse_args()

    if not path.exists(args.outdir):
        mkdir(args.outdir)

    for input_file in args.input_files:
        with codecs.open(input_file, 'r', 'utf-8') as pre:
            raw_content = pre.read()

        content = clean(raw_content)
        if not content:
            continue
        out_file = path.basename(input_file)
        out = path.join(args.outdir, path.basename(input_file))

        print(out_file)
        with codecs.open(out, 'w', encoding='utf-8') as outfile:
            outfile.write(content)

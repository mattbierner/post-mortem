import codecs
import argparse
import re
from os import path
from bs4 import BeautifulSoup


def clean(raw_content):
    """
    Extracts article contents from raw wikipedia html
    """
    soup = BeautifulSoup(raw_content, 'html.parser')

    # Remove reference links
    for a in soup.findAll('a'):
        if re.match(r'\s*\[\d+\]\s*', a.get_text(), re.MULTILINE | re.UNICODE):
            a.extract()

    # Remove edit buttons
    for span in soup.findAll('span', class_='mw-editsection'):
        span.extract()

    result = []
    start = soup.find('table', class_='infobox')
    end = soup.find(id='References').parent
    while start and start is not end:
        result.append(unicode(start))
        start = start.next_sibling

    return unicode('').join(result)


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

for input_file in args.input_files:
    with codecs.open(input_file, 'r', 'utf-8') as pre:
        raw_content = pre.read()

    content = clean(raw_content)

    out = path.join(args.outdir, path.basename(input_file))
    with codecs.open(out, 'w', encoding='utf-8') as outfile:
        outfile.write(content)

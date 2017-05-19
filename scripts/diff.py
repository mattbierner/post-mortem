import codecs
import argparse
from lxml.html.diff import htmldiff
import re
from bs4 import BeautifulSoup


def preprocess(input):
    output = re.sub(r'\<a href="[^"]+?"\>\[\d+\]\</a\>', '', input)
    return output


parser = argparse.ArgumentParser(description='Get revisions.')
parser.add_argument('left')
parser.add_argument('right')

args = parser.parse_args()


with codecs.open(args.left, 'r', 'utf-8') as left:
    left_content = left.read()

with codecs.open(args.right, 'r', 'utf-8') as right:
    right_content = right.read()


content = htmldiff(
    preprocess(left_content),
    preprocess(right_content)).encode('utf8')


page = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Blar</title>
  <base href="https://en.wikipedia.org">
  <link rel="stylesheet" href="/w/load.php?debug=false&amp;lang=en&amp;modules=site.styles&amp;only=styles&amp;skin=vector"/>


  <style>
    ins {{
        background: green;
    }}

    del {{
        background: red;
    }}
  </style>
</head>

<body>
 {0}
</body>
</html>
"""

print page.format(content)

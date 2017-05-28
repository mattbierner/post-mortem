import argparse
from os import path, listdir

from get_revisions import get_revisions
from get_contents import get_contents
from clean import do_clean
from diff import do_diff

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--name')
    parser.add_argument('--base')
    parser.add_argument('--first')
    parser.add_argument('--outdir')

    args = parser.parse_args()

    revisons_out_json = get_revisions(
        args.name,
        args.base,
        args.first,
        path.join(args.outdir, 'revisions'))

    raw_contents_dir = path.join(args.outdir, 'raw', args.name)
    get_contents(
        args.name,
        revisons_out_json,
        raw_contents_dir)

    contents_dir = do_clean(
        [path.join(raw_contents_dir, x) for x in listdir(raw_contents_dir)],
        path.join(args.outdir, 'content', args.name))

    do_diff(
        path.join(contents_dir, args.base + '.html'),
        [path.join(contents_dir, x) for x in listdir(contents_dir)],
        path.join(args.outdir, 'diff', args.name))

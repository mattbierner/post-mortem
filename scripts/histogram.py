import argparse
from datetime import timedelta
from matplotlib.dates import DateFormatter, DayLocator, epoch2num
import matplotlib.pyplot as plt
import numpy as np
import revisions as revisions
from wikipedia_api import iso_to_datetime
to_timestamp = np.vectorize(lambda x: int(x.strftime('%s')))


def get_backwards(title, id, span, bin_span=None):
    results = revisions.get_backward_revisions(title, id, span)
    timestamps = [iso_to_datetime(r['timestamp']) for r in results]

    first = timestamps[0]
    last = timestamps[-1] + timedelta(seconds=1)
    bins = []

    while last > first:
        bins = [last] + bins
        last -= bin_span
    bins = [last] + bins
    return (timestamps, bins)


def get_forwards(title, id, span, bin_span=None):
    results = revisions.get_forward_revisions(title, id, span)
    timestamps = [iso_to_datetime(r['timestamp']) for r in results]
    first = timestamps[0]
    last = timestamps[-1]
    bins = []

    while first < last:
        bins.append(first)
        first += bin_span
    bins.append(last + timedelta(seconds=1))
    return (timestamps, bins)


def to_matplotlib_dates(timestamps):
    return [epoch2num(x) for x in to_timestamp(timestamps)]


def hist(timestamps, bins, **kwargs):
    return plt.hist(
        to_matplotlib_dates(timestamps),
        bins=to_matplotlib_dates(bins),
        **kwargs)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('name')
    parser.add_argument('edit')

    args = parser.parse_args()

    subject = args.name
    first_death_edit = args.edit

    span = timedelta(days=30)
    bin_span = timedelta(days=1)

    backward_timestamps, backward_bins = get_backwards(
        subject, first_death_edit, span, bin_span=bin_span)

    forward_timestamps, forward_bins = get_forwards(
        subject, first_death_edit, span, bin_span=bin_span)

    fig, ax = plt.subplots(1, 1)

    hist(backward_timestamps, backward_bins,
         label='{0} is Present Tense'.format(subject), align='left')
    hist(forward_timestamps, forward_bins,
         label='{0} is Past Tense'.format(subject), align='left')

    ticks = to_matplotlib_dates(backward_bins + forward_bins[1:])
    ax.set_xlim([ticks[0], ticks[-1]])
    ax.set_xticks(ticks)
    ax.set_xticklabels(
        [x for x in range(-len(backward_bins) + 1, 0, 1)] +
        [x for x in range(0, len(forward_bins) - 1)])

    ax.set_xlabel('Days After Death')
    ax.set_ylabel('Number of Wikipedia Revisions Per Day')

    plt.title('Revisions of {0}\n'.format(subject))
    plt.legend()
    plt.show()

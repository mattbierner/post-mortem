import jmespath

import wikipedia_api as wikipedia_api

BATCH_SIZE = 'max'


def get_revisions(title, count=1, **kwargs):
    """Get revisions of an article"""
    response = wikipedia_api.make_request(
        action='query',
        prop='revisions',
        titles=title,
        rvprop='ids|timestamp|flags|comment|user|parsedcomment',
        rvlimit=count,
        rvexpandtemplates=1,
        rvdir='newer',
        **kwargs)

    if response.status_code is not 200:
        raise StandardError("Error")

    response_json = response.json()
    cont = jmespath.search('continue.rvcontinue', response_json)
    return (jmespath.search('query.pages.*.revisions[]', response_json), cont)


def get_forward_revisions(title, revision_id, time_delta):
    """Get all revisions of an article after revision_id"""
    start, _ = get_revisions(title, rvstartid=revision_id, count=1)
    start_time = wikipedia_api.iso_to_datetime(start[0]['timestamp'])
    end_time = start_time + time_delta

    results = []
    cont = None
    while True:
        revisions, query_cont = get_revisions(
            title,
            rvstartid=revision_id,
            count=BATCH_SIZE,
            rvend=wikipedia_api.datetime_to_iso(end_time),
            rvcontinue=cont)
        if not revisions or not len(revisions):
            break
        cont = query_cont
        results += revisions
        if not cont:
            break

    return results


def get_backward_revisions(title, revision_id, time_delta):
    """Get all revisions of an article leading up to revision_id"""
    start, _ = get_revisions(title, rvstartid=revision_id, count=1)
    start_time = wikipedia_api.iso_to_datetime(start[0]['timestamp'])
    end_time = start_time - time_delta

    results = []
    cont = None
    while True:
        revisions, query_cont = get_revisions(
            title,
            rvendid=revision_id,
            count=BATCH_SIZE,
            rvstart=wikipedia_api.datetime_to_iso(end_time),
            order='older',
            rvcontinue=cont)
        if not revisions or not len(revisions):
            break
        cont = query_cont
        results += revisions
        if not cont:
            break

    return results

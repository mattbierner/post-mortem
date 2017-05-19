import jmespath

import wikipedia_api as wikipedia_api


def get_content(title, oldid=None, **kwargs):
    """Get revisions of an article"""
    response = wikipedia_api.make_request(
        action='parse',
        # title=title,
        oldid=oldid,
        **kwargs)

    if response.status_code is not 200:
        raise StandardError("Error")

    response_json = response.json()
    return jmespath.search('parse.text.*', response_json)[0]

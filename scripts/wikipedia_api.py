from datetime import datetime
import urllib
import dateutil.parser
import jmespath
import requests

API_ENDPOINT = "https://en.wikipedia.org/w/api.php"


def iso_to_datetime(date_str):
    """Convert a json date string to a datetime object"""
    return dateutil.parser.parse(date_str)


def datetime_to_iso(date):
    """Convert a datetime object to a iso date string"""
    return date.isoformat().replace('+00:00', 'Z')


def make_request(**kwargs):
    """Make a request against the wikipedia API"""
    return requests.get(
        API_ENDPOINT + "?format=json&" +
        urllib.urlencode({key: value for key, value in kwargs.items() if value is not None}))

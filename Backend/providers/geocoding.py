import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"


def geocode_address(address):
    if not address:
        return None, None

    params = {"q": address, "format": "json", "limit": 1}
    headers = {
        "User-Agent": getattr(
            settings, "GEOCODING_USER_AGENT", "local-service-marketplace/1.0"
        )
    }

    try:
        response = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=5)
        response.raise_for_status()
        results = response.json()
    except (requests.RequestException, ValueError) as exc:
        logger.warning("Geocoding failed for address %r: %s", address, exc)
        return None, None

    if not results:
        return None, None

    try:
        return float(results[0]["lat"]), float(results[0]["lon"])
    except (KeyError, ValueError, TypeError):
        return None, None
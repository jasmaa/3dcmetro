import os
import json
from urllib3 import PoolManager
from urllib3.util import Retry

BASE_PATH = "src/data"

retries = Retry(total=5,
                backoff_factor=1,
                status_forcelist=[429, 500, 502, 503, 504],
                raise_on_status=True)
http = PoolManager(retries=retries)


def get_stations():
    resp = http.request(
        "GET", "https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Transportation_WebMercator/MapServer/51/query?outFields=*&where=1%3D1&f=geojson"
    )
    return json.loads(resp.data.decode("UTF-8"))


def get_lines():
    resp = http.request(
        "GET", "https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Transportation_WebMercator/MapServer/58/query?outFields=*&where=1%3D1&f=geojson"
    )
    return json.loads(resp.data.decode("UTF-8"))


if __name__ == "__main__":
    stations_data = get_stations()
    lines_data = get_lines()

    with open(os.path.join(BASE_PATH, "stations.json"), "w") as f:
        json.dump(stations_data, f)
    with open(os.path.join(BASE_PATH, "lines.json"), "w") as f:
        json.dump(lines_data, f)

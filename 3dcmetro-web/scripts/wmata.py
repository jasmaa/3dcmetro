import os
import json
from urllib3 import PoolManager
from urllib3.util import Retry
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")
BASE_PATH = "src/data"

retries = Retry(total=5,
                backoff_factor=1,
                status_forcelist=[429, 500, 502, 503, 504],
                raise_on_status=True)
http = PoolManager(retries=retries)


def get_stations():
    resp = http.request("GET", "https://api.wmata.com/Rail.svc/json/jStations", headers={
        "api_key": API_KEY,
    })
    return json.loads(resp.data.decode("UTF-8"))


def get_lines():
    resp = http.request("GET", "https://api.wmata.com/Rail.svc/json/jLines", headers={
        "api_key": API_KEY,
    })
    return json.loads(resp.data.decode("UTF-8"))


def get_station_path(from_station_code, to_station_code):
    resp = http.request("GET", f"https://api.wmata.com/Rail.svc/json/jPath?FromStationCode={from_station_code}&ToStationCode={to_station_code}", headers={
        "api_key": API_KEY,
    })
    return json.loads(resp.data.decode("UTF-8"))


if __name__ == "__main__":
    stations_data = get_stations()
    lines_data = get_lines()
    paths_data = {}
    for line in lines_data["Lines"]:
        paths_data[line["LineCode"]] = get_station_path(
            line["StartStationCode"],
            line["EndStationCode"],
        )

    with open(os.path.join(BASE_PATH, "stations.json"), "w") as f:
        json.dump(stations_data, f)
    with open(os.path.join(BASE_PATH, "paths.json"), "w") as f:
        json.dump(paths_data, f)

import * as THREE from "three";
import proj4 from "proj4";
import maplibregl from 'maplibre-gl';
import { stationData, linesData, lineName2Color, trackLine2Color } from "./wmata";
import { getTrainLocationData } from "./train";
import ModelLayer from "./model-layer";
import metroStationImageUrl from "./assets/metro_station.png"

const centerLon = -77.0365512601176;
const centerLat = 38.8976762795752;

const map = new maplibregl.Map({
  container: 'map', // container id
  style: 'https://demotiles.maplibre.org/style.json', // style URL
  center: [centerLon, centerLat],
  zoom: 12,
  pitch: 60,
  bearing: -45,
  minZoom: 8,
  maxZoom: 15,
  maxBounds: [[centerLon - 1, centerLat - 0.5], [centerLon + 1, centerLat + 0.5]],
});

map.on('style.load', async () => {
  map.resize();

  // Add rail line sources
  for (const line of linesData.features) {
    const name = line.properties.NAME;
    map.addSource(`line-${name}-data`, {
      "type": "geojson",
      "data": line as GeoJSON.GeoJSON,
    });
  }

  // Add station source
  map.addSource("stations-data", {
    "type": "geojson",
    "data": stationData as GeoJSON.GeoJSON,
  });

  // Add station image
  const metroStationImage = await map.loadImage(metroStationImageUrl);
  map.addImage('station', metroStationImage.data);

  // Add rail line lines
  for (const line of linesData.features) {
    const name = line.properties.NAME;
    const color = lineName2Color.get(name)!;
    map.addLayer({
      'id': `line-${name}`,
      'type': 'line',
      'source': `line-${name}-data`,
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': color,
        'line-width': 8,
      }
    });
  }

  // Add station icons
  map.addLayer({
    'id': 'station-icons',
    'type': 'symbol',
    'source': 'stations-data',
    'layout': {
      'icon-image': 'station',
      'icon-size': 0.15,
      "icon-pitch-alignment": 'map',
      'icon-allow-overlap': true,
    }
  });

  // Add train models
  const itt2Config = new Map<string, { position: Array<number> }>();
  const updateTrainPositions = async () => {
    const trainLocationData = await getTrainLocationData() as any;
    for (const train of trainLocationData["features"]) {
      const itt = train["attributes"]["ITT"];

      // Create and cache train config if train was not seen before
      if (!itt2Config.has(itt)) {
        const geometry = new THREE.BoxGeometry(50, 50, 50)
        const trackLine = train["attributes"]["TRACKLINE"];
        const color = trackLine2Color.get(trackLine);
        if (color) {
          const config = {
            position: [0, 0],
          };
          const material = new THREE.MeshBasicMaterial({ color });
          const mesh = new THREE.Mesh(geometry, material);
          map.addLayer(new ModelLayer(
            `train-${itt}`,
            mesh,
            config.position as maplibregl.LngLatLike,
          ));
          itt2Config.set(itt, config);
        } else {
          console.error("Track line color not found");
        }
      }

      const config = itt2Config.get(itt)!;

      // Update train position
      // Convert from WebMercator to LonLat
      const position = proj4(
        "EPSG:3857",
        "WGS84",
        [train["geometry"]["x"], train["geometry"]["y"]],
      );
      config.position[0] = position[0];
      config.position[1] = position[1];
    }
  }
  await updateTrainPositions();
  setInterval(updateTrainPositions, 5000);

  // Add station labels
  map.addLayer({
    'id': 'stations-labels',
    'type': 'symbol',
    'source': 'stations-data',
    'layout': {
      'text-field': ['get', 'NAME'],
    },
    'paint': {
      'text-color': 'black',
      'text-halo-color': 'white',
      'text-halo-width': 2,
    },
  });
});
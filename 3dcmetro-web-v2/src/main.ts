import * as THREE from "three";
import proj4 from "proj4";
import maplibregl from 'maplibre-gl';
import { stationData, linesData, lineName2Color, trackLine2Color } from "./wmata";
import { getTrainLocationData } from "./train";
import ModelLayer from "./model-layer";

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

map.on('style.load', () => {
  map.resize();

  // Add rail lines
  for (const railLine of linesData.features) {
    const railName = railLine.properties.NAME;
    const color = lineName2Color.get(railName);
    if (color) {
      map.addSource(railName, {
        "type": "geojson",
        "data": railLine as GeoJSON.GeoJSON,
      });
      map.addLayer({
        'id': railName,
        'type': 'line',
        'source': railName,
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': color,
          'line-width': 5
        }
      });
    } else {
      console.error("Failed to add rail line. Color not found.");
    }
  }

  // Add station models
  map.addSource("stations", {
    "type": "geojson",
    "data": stationData as GeoJSON.GeoJSON,
  });

  for (const station of stationData.features) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(50, 50, 10, 32.0),
      new THREE.MeshBasicMaterial({ color: "white" }),
    );
    map.addLayer(new ModelLayer(
      `station-model-${station.properties.NAME}`,
      mesh,
      station.geometry.coordinates as maplibregl.LngLatLike,
    ));
  }

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
  updateTrainPositions();
  setInterval(updateTrainPositions, 5000);

  // Add station labels
  map.addLayer({
    'id': 'station-labels',
    'type': 'symbol',
    'source': 'stations',
    'layout': {
      'text-field': ['get', 'NAME'],
    }
  });
});
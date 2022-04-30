import * as THREE from 'three';
import proj4 from "proj4";
import stationsData from "./data/stations.json";
import linesData from "./data/lines.json";
import { getTrainLocationData } from "./trains";

const centerLat = 38.8976762795752;
const centerLon = -77.0365512601176;
const scaleFactor = 100;
const trackingRadius = 5;
const timeScale = 0.0005;

const lineName2Color = {
  "blue": "blue",
  "green": "green",
  "orange": "orange",
  "silver": "silver",
  "red": "red",
  "yellow": "yellow",
};

const trackLine2Color = {
  "Blue": "blue",
  "Green": "green",
  "Orange": "orange",
  "Silver": "silver",
  "Red": "red",
  "Yellow": "yellow",
};

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);

const scene = new THREE.Scene();

// Render stations
for (const station of stationsData.features) {
  const scaledX = scaleFactor * (station.geometry.coordinates[0] - centerLon);
  const scaledY = -scaleFactor * (station.geometry.coordinates[1] - centerLat);

  const geometry = new THREE.CylinderGeometry(0.08, 0.08, 0.01, 32);
  const material = new THREE.MeshBasicMaterial({ color: "white" });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(scaledX, 0, scaledY);
  scene.add(mesh);
}

// Render rail lines
for (const railLine of linesData.features) {
  const points = railLine.geometry.coordinates.map(coord =>
    new THREE.Vector3(scaleFactor * (coord[0] - centerLon), 0, -scaleFactor * (coord[1] - centerLat))
  )
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: lineName2Color[railLine.properties.NAME] });
  const line = new THREE.Line(geometry, material);
  scene.add(line);
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

function animation(time) {
  camera.position.set(trackingRadius * Math.cos(time * timeScale), 3, trackingRadius * Math.sin(time * timeScale));
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

const source = new proj4.Proj('EPSG:3857');
const dest = new proj4.Proj('WGS84');

const itt2Mesh = new Map();
async function updateTrainPositions() {
  const trainLocationData = await getTrainLocationData();
  for (const train of trainLocationData.features) {
    if (!itt2Mesh.has(train.attributes.ITT)) {
      const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const material = new THREE.MeshBasicMaterial({ color: trackLine2Color[train.attributes.TRACKLINE] });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      itt2Mesh.set(train.attributes.ITT, mesh);
    }

    const pt = proj4(source, dest, [train.geometry.x, train.geometry.y]); // Convert from WebMercator to LonLat
    const mesh = itt2Mesh.get(train.attributes.ITT);
    const scaledX = scaleFactor * (pt[0] - centerLon);
    const scaledY = -scaleFactor * (pt[1] - centerLat);
    mesh.position.set(scaledX, 0, scaledY);
  }
}

updateTrainPositions();
setInterval(updateTrainPositions, 5_000);

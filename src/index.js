import * as THREE from 'three';
import stationsData from "./data/stations.json";
import pathsData from "./data/paths.json";

const centerLat = 38.8976762795752;
const centerLon = -77.0365512601176;
const scaleFactor = 50;

const lineCode2Color = {
  "BL": "blue",
  "GR": "green",
  "OR": "orange",
  "SV": "silver",
  "RD": "red",
  "YL": "yellow",
};

(() => {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);

  const scene = new THREE.Scene();

  // Render stations
  const stationPts = new Map();
  for (const station of stationsData.Stations) {
    const scaledX = scaleFactor * (station.Lon - centerLon);
    const scaledY = -scaleFactor * (station.Lat - centerLat);

    stationPts.set(station.Code, {
      x: scaledX,
      y: scaledY,
    });

    const geometry = new THREE.CylinderGeometry(0.03, 0.03, 0.01, 32);
    const material = new THREE.MeshBasicMaterial({ color: "white" });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(scaledX, 0, scaledY);
    scene.add(mesh);
  }

  // Render lines
  const lineCounter = new Map();
  for (const lineCode of Object.keys(pathsData)) {
    const pathData = pathsData[lineCode];
    for (let i = 1; i < pathData.Path.length; i++) {
      const fromStation = pathData.Path[i - 1].StationCode;
      const toStation = pathData.Path[i].StationCode;

      const lineKey = fromStation < toStation ? `${fromStation}-${toStation}` : `${toStation}-${fromStation}`;
      if (lineCounter.has(lineKey)) {
        lineCounter.set(lineKey, lineCounter.get(lineKey) + 1);
      } else {
        lineCounter.set(lineKey, 1);
      }

      // Place lines side by side
      const pt1 = stationPts.get(fromStation);
      const pt2 = stationPts.get(toStation);
      const dx = pt2.x - pt1.x;
      const dy = pt2.y - pt1.y;
      const mag = Math.sqrt(dx * dx + dy * dy);
      const dirX = dy / mag;
      const dirY = -dx / mag;
      const t = lineCounter.get(lineKey);
      const mult = Math.pow(-1, t) * Math.floor(t / 2); // 0, -1, 1, 2, -2, ...
      const offsetX = 0.02 * mult * dirX;
      const offsetY = 0.02 * mult * dirY;
      const points = [new THREE.Vector3(pt1.x + offsetX, 0, pt1.y + offsetY), new THREE.Vector3(pt2.x + offsetX, 0, pt2.y + offsetY)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: lineCode2Color[lineCode] });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    }
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animation);
  document.body.appendChild(renderer.domElement);

  const trackingRadius = 5;
  const timeScale = 0.0005;
  function animation(time) {
    camera.position.set(trackingRadius * Math.cos(time * timeScale), 3, trackingRadius * Math.sin(time * timeScale));
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
})();

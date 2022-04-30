import * as THREE from 'three';
import stationsData from "./data/stations.json";
import linesData from "./data/lines.json";

const centerLat = 38.8976762795752;
const centerLon = -77.0365512601176;
const scaleFactor = 100;

const lineName2Color = {
  "blue": "blue",
  "green": "green",
  "orange": "orange",
  "silver": "silver",
  "red": "red",
  "yellow": "yellow",
};

(() => {
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);

  const scene = new THREE.Scene();

  // Render stations
  for (const station of stationsData.features) {
    const scaledX = scaleFactor * (station.geometry.coordinates[0] - centerLon);
    const scaledY = -scaleFactor * (station.geometry.coordinates[1] - centerLat);

    const geometry = new THREE.CylinderGeometry(0.03, 0.03, 0.01, 32);
    const material = new THREE.MeshBasicMaterial({ color: "white" });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(scaledX, 0, scaledY);
    scene.add(mesh);
  }

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

  const trackingRadius = 5;
  const timeScale = 0.0005;
  function animation(time) {
    camera.position.set(trackingRadius * Math.cos(time * timeScale), 3, trackingRadius * Math.sin(time * timeScale));
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
})();

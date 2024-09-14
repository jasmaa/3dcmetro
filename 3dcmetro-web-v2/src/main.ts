import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import proj4 from "proj4";
import { stationData, linesData, lineName2Color, trackLine2Color } from "./wmata";
import { getTrainLocationData } from "./train";

const centerLat = 38.8976762795752;
const centerLon = -77.0365512601176;
const scaleFactor = 100.0;

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);

camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

// Add stations
const textMeshes: THREE.Mesh[] = [];
for (const station of stationData["features"]) {
  const stationCoordinates = station["geometry"]["coordinates"];
  const scaledX = scaleFactor * (stationCoordinates[0] - centerLon);
  const scaledY = -1.0 * scaleFactor * (stationCoordinates[1] - centerLat);

  // Add stop
  const geometry = new THREE.CylinderGeometry(0.08, 0.08, 0.01, 32.0);
  const material = new THREE.MeshBasicMaterial({ color: "white" });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(scaledX, 0.0, scaledY);
  scene.add(mesh);

  // Add sign
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 800;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textAlign = "center";
    ctx.font = "24px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(station["properties"]["NAME"], canvas.width / 2, canvas.height / 2);

    const textTexture = new THREE.Texture(canvas);
    textTexture.needsUpdate = true;

    const textMaterial = new THREE.MeshBasicMaterial({
      map: textTexture,
      color: "white",
      transparent: true,
    });

    const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 10, 10), textMaterial);
    textMesh.position.set(scaledX, 0.3, scaledY);
    scene.add(textMesh);

    textMeshes.push(textMesh);
  } else {
    console.error("Unable to get context");
  }
}

// Add rail lines
for (const railLine of linesData.features) {
  const coordinates = railLine["geometry"]["coordinates"]

  const points = coordinates.map(coord => new THREE.Vector3(
    scaleFactor * (coord[0] - centerLon),
    0.0,
    -1.0 * scaleFactor * (coord[1] - centerLat),
  ));

  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(points);

  const railName = railLine["properties"]["NAME"];
  const color = lineName2Color.get(railName);
  if (railName) {
    const material = new THREE.LineBasicMaterial({ color });
    const line = new THREE.Line(geometry, material)
    scene.add(line);
  } else {
    console.error("Color not found");
  }
}

const renderer = new THREE.WebGLRenderer({ "antialias": true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1.0;
controls.maxDistance = 50.0;
controls.maxPolarAngle = Math.PI / 2.0;

const animate = () => {
  requestAnimationFrame(animate);
  controls.update()
  for (const textMesh of textMeshes) {
    textMesh.lookAt(camera["position"]);
  }
  renderer.render(scene, camera);
}
animate();


const itt2Mesh = new Map();
const updateTrainPositions = async () => {
  const trainLocationData = await getTrainLocationData() as any;
  for (const train of trainLocationData["features"]) {
    const itt = train["attributes"]["ITT"];

    // Create and cache train mesh if train was not seen before
    if (!itt2Mesh.has(itt)) {
      const geometry = new THREE.BoxGeometry(0.08, 0.08, 0.08)
      const trackLine = train["attributes"]["TRACKLINE"];
      const color = trackLine2Color.get(trackLine);
      if (color) {
        const material = new THREE.MeshBasicMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        itt2Mesh.set(itt, mesh);
      } else {
        console.error("Track line color not found");
      }
    }

    // Update train position
    // Convert from WebMercator to LonLat
    const point = proj4(
      "EPSG:3857",
      "WGS84",
      [train["geometry"]["x"], train["geometry"]["y"]],
    );
    const mesh = itt2Mesh.get(itt)!;
    const scaledX = scaleFactor * (point[0] - centerLon);
    const scaledY = -1.0 * scaleFactor * (point[1] - centerLat);
    mesh.position.set(scaledX, 0.0, scaledY)
  }
}
updateTrainPositions();
setInterval(updateTrainPositions, 5000);
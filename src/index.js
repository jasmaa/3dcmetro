import stationsData from "./data/stations.json";
import pathsData from "./data/paths.json";

const canvas = document.getElementById("mainCanvas");
const width = canvas.width;
const height = canvas.height;
const ctx = canvas.getContext("2d");

const centerLat = 38.8976762795752;
const centerLon = -77.0365512601176;
const centerX = width / 360.0 * (180 + centerLon);
const centerY = height / 180.0 * (90 - centerLat);
const scaleFactor = 350;

const lineCode2Color = {
  "BL": "blue",
  "GR": "green",
  "OR": "orange",
  "SV": "silver",
  "RD": "red",
  "YL": "yellow",
};

(async () => {
  const stationPts = new Map();

  for (const station of stationsData.Stations) {
    const x = width / 360.0 * (180 + station.Lon);
    const y = height / 180.0 * (90 - station.Lat);
    const scaledX = scaleFactor * (x - centerX) + width / 2;
    const scaledY = scaleFactor * (y - centerY) + height / 2;

    stationPts.set(station.Code, {
      x: scaledX,
      y: scaledY,
    });

    ctx.beginPath();
    ctx.arc(scaledX, scaledY, 5, 0, Math.PI * 2, false);
    ctx.strokeStyle = "black"
    ctx.stroke();
    ctx.closePath();
  }

  for (const lineCode of Object.keys(pathsData)) {
    const pathData = pathsData[lineCode];
    for (let i = 1; i < pathData.Path.length; i++) {
      const pt1 = stationPts.get(pathData.Path[i - 1].StationCode);
      const pt2 = stationPts.get(pathData.Path[i].StationCode);
      ctx.beginPath();
      ctx.moveTo(pt1.x, pt1.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.strokeStyle = lineCode2Color[lineCode];
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.closePath();
    }
  }
})();

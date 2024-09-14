import * as stationData from "./data/Metro_Stations_Regional.json";
import * as linesData from "./data/Metro_Lines_Regional.json";

const lineName2Color = new Map([
  ["blue", "blue"],
  ["green", "green"],
  ["orange", "orange"],
  ["silver", "silver"],
  ["red", "red"],
  ["yellow", "yellow"],
]);

const trackLine2Color = new Map([
  ["Blue", "blue"],
  ["Green", "green"],
  ["Orange", "orange"],
  ["Silver", "silver"],
  ["Red", "red"],
  ["Yellow", "yellow"],
]);

export { stationData, linesData, lineName2Color, trackLine2Color };
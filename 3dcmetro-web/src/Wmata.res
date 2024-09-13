module Coordinates = {
  type t
  @get_index external get: (t, int) => float = ""
}

module Station = {
  type t = {"geometry": {"coordinates": Coordinates.t}, "properties": {"NAME": string}}
}

module Line = {
  type t = {"geometry": {"coordinates": array<Coordinates.t>}, "properties": {"NAME": string}}
}

module Train = {
  type t = {
    "attributes": {"ITT": string, "TRACKLINE": string},
    "geometry": {"x": float, "y": float},
  }
}

type stationData = {"features": array<Station.t>}
@module("./data/Metro_Stations_Regional.geojson") external stationsData: stationData = "default"

type linesData = {"features": array<Line.t>}
@module("./data/Metro_Lines_Regional.geojson") external linesData: linesData = "default"

type trainData = {"features": array<Train.t>}

let lineName2Color = Js.Dict.fromArray([
  ("blue", "blue"),
  ("green", "green"),
  ("orange", "orange"),
  ("silver", "silver"),
  ("red", "red"),
  ("yellow", "yellow"),
])

let trackLine2Color = Js.Dict.fromArray([
  ("Blue", "blue"),
  ("Green", "green"),
  ("Orange", "orange"),
  ("Silver", "silver"),
  ("Red", "red"),
  ("Yellow", "yellow"),
])

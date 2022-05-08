module Proj = {
  type t
  @module("./proj4") external make: string => t = "Proj"
}
@module("./proj4") external proj4: (Proj.t, Proj.t, array<float>) => array<float> = "default"

let epsg_3857 = Proj.make("EPSG:3857")
let wgs84 = Proj.make("WGS84")

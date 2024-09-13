module Vector3 = {
  type t
  @module("three") @new external make: (float, float, float) => t = "Vector3"
}

module Position = {
  type t
  @send external set: (t, float, float, float) => unit = "set"
}

module Object3D = {
  type t = {"position": Position.t}
  @send external lookAt1: (t, Position.t) => unit = "lookAt"
  @send external lookAt3: (t, float, float, float) => unit = "lookAt"
}

module Camera = {
  include Object3D
}

module PerspectiveCamera = {
  include Camera
  @module("three") @new external make: (float, float, float, float) => t = "PerspectiveCamera"
}

module Geometry = {
  type t
}

module CylinderGeometry = {
  include Geometry
  @module("three") @new external make: (float, float, float, float) => t = "CylinderGeometry"
}

module BufferGeometry = {
  include Geometry
  @module("three") @new external make: unit => t = "BufferGeometry"
  @send external setFromPoints: (t, array<Vector3.t>) => unit = "setFromPoints"
}

module BoxGeometry = {
  include Geometry
  @module("three") @new external make: (float, float, float) => t = "BoxGeometry"
}

module PlaneGeometry = {
  include Geometry
  @module("three") @new external make2: (float, float) => t = "PlaneGeometry"
  @module("three") @new external make4: (float, float, int, int) => t = "PlaneGeometry"
}

module Texture = {
  type t
  @module("three") @new external make: Dom.htmlCanvasElement => t = "Texture"
  @set external setNeedsUpdate: (t, bool) => unit = "needsUpdate"
}

module Material = {
  type t
  type props = {"color": option<string>, "map": option<Texture.t>, "transparent": option<bool>}
  let makeProps = (~color=?, ~map=?, ~transparent=?, ()) => {
    {
      "color": color,
      "map": map,
      "transparent": transparent,
    }
  }
}

module MeshBasicMaterial = {
  include Material
  @module("three") @new external make0: unit => t = "MeshBasicMaterial"
  @module("three") @new external make1: props => t = "MeshBasicMaterial"
}

module LineBasicMaterial = {
  include Material
  @module("three") @new external make0: unit => t = "LineBasicMaterial"
  @module("three") @new external make1: props => t = "LineBasicMaterial"
}

module Mesh = {
  include Object3D
  @module("three") @new external make: (Geometry.t, Material.t) => t = "Mesh"
}

module Line = {
  include Object3D
  @module("three") @new external make: (Geometry.t, Material.t) => t = "Line"
}

module Scene = {
  type t
  @module("three") @new external make: unit => t = "Scene"
  @send external addMesh: (t, Mesh.t) => unit = "add"
  @send external addLine: (t, Line.t) => unit = "add"
}

module Renderer = {
  type t
  @send external render: (t, Scene.t, Camera.t) => unit = "render"
  @send external setSize: (t, int, int) => unit = "setSize"
  @get external getDomElement: t => Dom.htmlCanvasElement = "domElement"
}

module WebGLRenderer = {
  include Renderer
  type init = {"antialias": bool}
  @module("three") @new external make: init => t = "WebGLRenderer"
}

module OrbitControls = {
  type t
  @module("three/examples/jsm/controls/OrbitControls") @new
  external make: (Camera.t, Dom.htmlCanvasElement) => t = "OrbitControls"
  @send external update: t => unit = "update"
  @send external listenToKeyEvents: (t, Dom.window) => unit = "listenToKeyEvents"
  @set external setEnableDamping: (t, bool) => unit = "enableDamping"
  @set external setDampingFactor: (t, float) => unit = "dampingFactor"
  @set external setScreenSpacePanning: (t, bool) => unit = "screenSpacePanning"
  @set external setMinDistance: (t, float) => unit = "minDistance"
  @set external setMaxDistance: (t, float) => unit = "maxDistance"
  @set external setMaxPolarAngle: (t, float) => unit = "maxPolarAngle"
}

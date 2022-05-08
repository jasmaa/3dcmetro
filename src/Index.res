open Promise

@val external setInterval: (unit => unit, int) => unit = "setInterval"
@val external requestAnimationFrame: (unit => unit) => unit = "requestAnimationFrame"
@val external window: Dom.window = "window"
@scope("window") @val external windowInnerWidth: int = "innerWidth"
@scope("window") @val external windowInnerHeight: int = "innerHeight"
@scope("document.body") @val
external appendChildToDocumentBody: Dom.htmlCanvasElement => unit = "append"

let centerLat = 38.8976762795752
let centerLon = -77.0365512601176
let scaleFactor = 100.0

let camera = Three.PerspectiveCamera.make(
  70.0,
  windowInnerWidth->Belt.Int.toFloat /. windowInnerHeight->Belt.Int.toFloat,
  0.01,
  1000.0,
)
camera["position"]->Three.Position.set(5.0, 5.0, 5.0)
camera->Three.PerspectiveCamera.lookAt3(0.0, 0.0, 0.0)

let scene = Three.Scene.make()

// Add stations
let textMeshes = []
for i in 0 to Wmata.stationsData["features"]->Belt.Array.length - 1 {
  switch Wmata.stationsData["features"]->Belt.Array.get(i) {
  | Some(station) =>
    let stationCoordinates = station["geometry"]["coordinates"]
    let scaledX = scaleFactor *. (stationCoordinates->Wmata.Coordinates.get(0) -. centerLon)
    let scaledY = -1.0 *. scaleFactor *. (stationCoordinates->Wmata.Coordinates.get(1) -. centerLat)

    // Add stop
    let geometry = Three.CylinderGeometry.make(0.08, 0.08, 0.01, 32.0)
    let material = Three.MeshBasicMaterial.make1(Three.Material.makeProps(~color="white", ()))
    let mesh = Three.Mesh.make(geometry, material)
    mesh["position"]->Three.Position.set(scaledX, 0.0, scaledY)
    scene->Three.Scene.addMesh(mesh)

    // Add sign
    let canvas = Canvas.createCanvas()
    canvas->Canvas.setWidth(800)
    canvas->Canvas.setHeight(800)
    let ctx = canvas->Canvas.getContext("2d")
    ctx->Canvas.Context.setTextAlign("center")
    ctx->Canvas.Context.setFont("24px Arial")
    ctx->Canvas.Context.setFillStyle("white")
    ctx->Canvas.Context.fillText(
      station["properties"]["NAME"],
      canvas->Canvas.getWidth->Belt.Int.toFloat /. 2.0,
      canvas->Canvas.getHeight->Belt.Int.toFloat /. 2.0,
    )
    let textTexture = Three.Texture.make(canvas)
    textTexture->Three.Texture.setNeedsUpdate(true)
    let textMaterial = Three.MeshBasicMaterial.make1(
      Three.Material.makeProps(~map=textTexture, ~color="white", ~transparent=true, ()),
    )
    let textMesh = Three.Mesh.make(Three.PlaneGeometry.make4(1.0, 1.0, 10, 10), textMaterial)
    textMesh["position"]->Three.Position.set(scaledX, 0.3, scaledY)
    scene->Three.Scene.addMesh(textMesh)
    let _ = textMeshes->Js.Array2.push(textMesh)
  | None => Js.Console.error("No station found")
  }
}

// Add rail lines
for i in 0 to Wmata.linesData["features"]->Belt.Array.length - 1 {
  switch Wmata.linesData["features"]->Belt.Array.get(i) {
  | Some(railLine) =>
    let coordinates = railLine["geometry"]["coordinates"]
    let points = Array.map(coord => {
      Three.Vector3.make(
        scaleFactor *. (coord->Wmata.Coordinates.get(0) -. centerLon),
        0.0,
        -1.0 *. scaleFactor *. (coord->Wmata.Coordinates.get(1) -. centerLat),
      )
    }, coordinates)
    let geometry = Three.BufferGeometry.make()
    geometry->Three.BufferGeometry.setFromPoints(points)
    let railName = railLine["properties"]["NAME"]
    switch Wmata.lineName2Color->Js.Dict.get(railName) {
    | Some(color) =>
      let material = Three.LineBasicMaterial.make1(Three.Material.makeProps(~color, ()))
      let line = Three.Line.make(geometry, material)
      scene->Three.Scene.addLine(line)
    | None => Js.Console.error("Color not found")
    }
  | None => Js.Console.error("No line found")
  }
}

let renderer = Three.WebGLRenderer.make({"antialias": true})
renderer->Three.WebGLRenderer.setSize(windowInnerWidth, windowInnerHeight)
appendChildToDocumentBody(renderer->Three.WebGLRenderer.getDomElement)

let controls = Three.OrbitControls.make(camera, renderer->Three.WebGLRenderer.getDomElement)
controls->Three.OrbitControls.listenToKeyEvents(window)
controls->Three.OrbitControls.setEnableDamping(true)
controls->Three.OrbitControls.setDampingFactor(0.05)
controls->Three.OrbitControls.setScreenSpacePanning(false)
controls->Three.OrbitControls.setMinDistance(1.0)
controls->Three.OrbitControls.setMaxDistance(50.0)
controls->Three.OrbitControls.setMaxPolarAngle(Js.Math._PI /. 2.0)

let rec animate = () => {
  requestAnimationFrame(animate)
  controls->Three.OrbitControls.update
  Js.Array2.forEach(textMeshes, textMesh => {
    textMesh->Three.Mesh.lookAt1(camera["position"])
  })
  renderer->Three.WebGLRenderer.render(scene, camera)
}
animate()

let itt2Mesh = Js.Dict.empty()
let updateTrainPositions = () => {
  Train.getTrainLocationData()
  ->then(trainLocationData => {
    for i in 0 to trainLocationData["features"]->Belt.Array.length - 1 {
      switch trainLocationData["features"]->Belt.Array.get(i) {
      | Some(train) =>
        // Create and cache train mesh if train was not seen before
        switch itt2Mesh->Js.Dict.get(train["attributes"]["ITT"]) {
        | Some(_) => ()
        | None =>
          let geometry = Three.BoxGeometry.make(0.08, 0.08, 0.08)
          let itt = train["attributes"]["ITT"]
          let trackLine = train["attributes"]["TRACKLINE"]
          switch Wmata.trackLine2Color->Js.Dict.get(trackLine) {
          | Some(color) =>
            let material = Three.MeshBasicMaterial.make1(Three.Material.makeProps(~color, ()))
            let mesh = Three.Mesh.make(geometry, material)
            scene->Three.Scene.addMesh(mesh)
            itt2Mesh->Js.Dict.set(itt, mesh)
          | None => Js.Console.error("Track line color not found")
          }
        }
        // Update train position
        // Convert from WebMercator to LonLat
        let pt = Proj4.proj4(
          Proj4.epsg_3857,
          Proj4.wgs84,
          [train["geometry"]["x"], train["geometry"]["y"]],
        )
        let mesh = itt2Mesh->Js.Dict.unsafeGet(train["attributes"]["ITT"])
        let scaledX = scaleFactor *. (pt[0] -. centerLon)
        let scaledY = -1.0 *. scaleFactor *. (pt[1] -. centerLat)
        mesh["position"]->Three.Position.set(scaledX, 0.0, scaledY)
      | None => Js.Console.error("No train found")
      }
    }
    resolve()
  })
  ->ignore
}
updateTrainPositions()
setInterval(updateTrainPositions, 5_000)

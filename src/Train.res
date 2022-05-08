open Promise

module Response = {
  type t
  @send external text: t => Js.Promise.t<string> = "text"
  @send external json: t => Js.Promise.t<Js.Json.t> = "json"
}

@val external fetch: string => Js.Promise.t<Response.t> = "fetch"

@scope("JSON") @val external parseIntoTrainData: string => Wmata.trainData = "parse"

let getTrainLocationData = () => {
  fetch(
    "https://gisservices.wmata.com/gisservices/rest/services/Public/TRAIN_LOC_WMS_PUB/MapServer/0/query?f=json&where=TRACKLINE%3C%3E%20%27Non-revenue%27%20and%20TRACKLINE%20is%20not%20null&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*",
  )
  ->then(response => {
    Response.text(response)
  })
  ->then(text => {
    resolve(parseIntoTrainData(text))
  })
}

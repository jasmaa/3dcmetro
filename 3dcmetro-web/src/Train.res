open Promise

module Response = {
  type t
  @send external text: t => Js.Promise.t<string> = "text"
  @send external json: t => Js.Promise.t<Js.Json.t> = "json"
}

@val external fetch: string => Js.Promise.t<Response.t> = "fetch"

@scope("JSON") @val external parseIntoTrainData: string => Wmata.trainData = "parse"

let getTrainLocationData = () => {
  fetch("http://localhost:8787/trainlocations")
  ->then(response => {
    Response.text(response)
  })
  ->then(text => {
    resolve(parseIntoTrainData(text))
  })
}

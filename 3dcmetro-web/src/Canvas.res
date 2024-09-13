module Context = {
  type t

  @set external setTextAlign: (t, string) => unit = "textAlign"
  @set external setFont: (t, string) => unit = "font"
  @set external setFillStyle: (t, string) => unit = "fillStyle"
  @send external fillText: (t, string, float, float) => unit = "fillText"
}

@scope("document") @val external createElement: string => Dom.htmlCanvasElement = "createElement"

let createCanvas = () => {
  createElement("canvas")
}

@send external getContext: (Dom.htmlCanvasElement, string) => Context.t = "getContext"
@get external getWidth: Dom.htmlCanvasElement => int = "width"
@get external getHeight: Dom.htmlCanvasElement => int = "height"
@set external setWidth: (Dom.htmlCanvasElement, int) => unit = "width"
@set external setHeight: (Dom.htmlCanvasElement, int) => unit = "height"
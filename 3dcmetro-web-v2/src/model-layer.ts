import * as THREE from "three";
import maplibregl from 'maplibre-gl';

/**
 * Map layer for 3D models. Based on:
 * https://maplibre.org/maplibre-gl-js/docs/examples/add-3d-model/
 */
export default class ModelLayer implements maplibregl.CustomLayerInterface {
  id: string
  type: "custom"
  modelOrigin: maplibregl.LngLatLike
  mesh: THREE.Mesh
  camera?: THREE.Camera
  scene?: THREE.Scene
  renderer?: THREE.WebGLRenderer
  map?: maplibregl.Map

  constructor(id: string, mesh: THREE.Mesh, modelOrigin: maplibregl.LngLatLike) {
    this.id = id;
    this.type = "custom";
    this.modelOrigin = modelOrigin;
    this.mesh = mesh;
  }

  onAdd(map: maplibregl.Map, gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();

    this.scene!.add(this.mesh);

    this.map = map;

    // use the MapLibre GL JS map canvas for three.js
    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true
    });

    this.renderer.autoClear = false;
  }

  render(_gl: WebGLRenderingContext | WebGL2RenderingContext, matrix: any) {
    const modelAltitude = 0;
    const modelRotate = [Math.PI / 2, 0, 0];

    const modelAsMercatorCoordinate = maplibregl.MercatorCoordinate.fromLngLat(
      this.modelOrigin,
      modelAltitude
    );

    // transformation parameters to position, rotate and scale the 3D model onto the map
    const modelTransform = {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      /* Since our 3D model is in real world meters, a scale transform needs to be
      * applied since the CustomLayerInterface expects units in MercatorCoordinates.
      */
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };

    const rotationX = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(1, 0, 0),
      modelTransform.rotateX
    );
    const rotationY = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 1, 0),
      modelTransform.rotateY
    );
    const rotationZ = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 0, 1),
      modelTransform.rotateZ
    );

    const m = new THREE.Matrix4().fromArray(matrix);
    const l = new THREE.Matrix4()
      .makeTranslation(
        modelTransform.translateX,
        modelTransform.translateY,
        modelTransform.translateZ
      )
      .scale(
        new THREE.Vector3(
          modelTransform.scale,
          -modelTransform.scale,
          modelTransform.scale
        )
      )
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ);

    this.camera!.projectionMatrix = m.multiply(l);
    this.renderer!.resetState();
    this.renderer!.render(this.scene!, this.camera!);
    this.map!.triggerRepaint();
  }
}
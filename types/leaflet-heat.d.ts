declare module 'leaflet.heat' {
  import * as L from 'leaflet';

  export interface HeatLatLngTuple extends Array<number> {
    0: number;
    1: number;
    2: number;
  }

  export interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: { [key: number]: string };
  }

  export interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: HeatLatLngTuple[]): this;
    addLatLng(latlng: HeatLatLngTuple): this;
    setOptions(options: HeatLayerOptions): this;
  }

  module 'leaflet' {
    function heatLayer(
      latlngs: HeatLatLngTuple[],
      options?: HeatLayerOptions
    ): HeatLayer;
  }
}

import maplibregl from 'maplibre-gl';
import RadarMarker from './RadarMarker';
import RadarMapFeature from './RadarMapFeature';
import RadarLineFeature from './RadarLineFeature';
import RadarPolygonFeature from './RadarPolygonFeature';
import type { RadarMapOptions, RadarLineOptions, RadarPolylineOptions, RadarPolygonOptions } from '../types';
declare class RadarMap extends maplibregl.Map {
    _markers: RadarMarker[];
    _features: RadarMapFeature[];
    constructor(radarMapOptions: RadarMapOptions);
    addMarker(marker: RadarMarker): void;
    removeMarker(marker: RadarMarker): void;
    getMarkers(): RadarMarker[];
    fitToMarkers(fitBoundsOptions?: maplibregl.FitBoundsOptions, overrideMarkers?: RadarMarker[]): void;
    clearMarkers(): void;
    getFeatures(): RadarMapFeature[];
    fitToFeatures(fitBoundsOptions?: maplibregl.FitBoundsOptions, overrideFeatures?: RadarMapFeature[]): void;
    clearFeatures(): void;
    addPolygon(polygon: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>, polygonOptions?: RadarPolygonOptions): RadarPolygonFeature;
    addLine(line: GeoJSON.Feature<GeoJSON.LineString>, lineOptions?: RadarLineOptions): RadarLineFeature;
    addPolyline(polyline: string, polylineOptions?: RadarPolylineOptions): RadarLineFeature;
}
export default RadarMap;

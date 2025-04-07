import maplibregl from 'maplibre-gl';
import type RadarMap from './RadarMap';
import type { RadarMarkerOptions } from '../types';
declare class RadarMarker extends maplibregl.Marker {
    _map: RadarMap;
    constructor(markerOptions: RadarMarkerOptions);
    addTo(map: RadarMap): this;
    remove(): this;
}
export default RadarMarker;

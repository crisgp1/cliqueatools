import maplibregl from 'maplibre-gl';
import RadarMap from './RadarMap';
import RadarMarker from './RadarMarker';
import type { RadarMapOptions, RadarMarkerOptions, RadarPopupOptions } from '../types';
declare class MapUI {
    static getMapLibre(): typeof maplibregl;
    static createMap(mapOptions: RadarMapOptions): RadarMap;
    static createMarker(markerOptions?: RadarMarkerOptions): RadarMarker;
    static createPopup(popupOptions: RadarPopupOptions): maplibregl.Popup;
}
export default MapUI;

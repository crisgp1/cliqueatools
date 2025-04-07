import RadarAPI from './api';
import MapUI from './ui/map';
import AutocompleteUI from './ui/autocomplete';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/radar.css';
declare class Radar extends RadarAPI {
    static get ui(): {
        maplibregl: typeof import("maplibre-gl");
        map: typeof MapUI.createMap;
        marker: typeof MapUI.createMarker;
        popup: typeof MapUI.createPopup;
        autocomplete: typeof AutocompleteUI.createAutocomplete;
    };
}
export default Radar;

import maplibregl from 'maplibre-gl';
import { RadarPopupOptions } from '../types';
declare class RadarPopup extends maplibregl.Popup {
    constructor(popupOptions: RadarPopupOptions);
}
export default RadarPopup;

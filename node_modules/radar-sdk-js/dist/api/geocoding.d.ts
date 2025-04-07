import { RadarForwardGeocodeParams, RadarReverseGeocodeParams, RadarGeocodeResponse, RadarIPGeocodeResponse } from '../types';
declare class Geocoding {
    static forwardGeocode(params: RadarForwardGeocodeParams): Promise<RadarGeocodeResponse>;
    static reverseGeocode(params: RadarReverseGeocodeParams): Promise<RadarGeocodeResponse>;
    static ipGeocode(): Promise<RadarIPGeocodeResponse>;
}
export default Geocoding;

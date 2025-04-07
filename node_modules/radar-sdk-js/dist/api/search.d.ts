import type { RadarAutocompleteParams, RadarAutocompleteResponse, RadarSearchPlacesParams, RadarSearchPlacesResponse, RadarSearchGeofencesParams, RadarSearchGeofencesResponse } from '../types';
declare class SearchAPI {
    static autocomplete(params: RadarAutocompleteParams, requestId?: string): Promise<RadarAutocompleteResponse>;
    static searchGeofences(params: RadarSearchGeofencesParams): Promise<RadarSearchGeofencesResponse>;
    static searchPlaces(params: RadarSearchPlacesParams): Promise<RadarSearchPlacesResponse>;
}
export default SearchAPI;

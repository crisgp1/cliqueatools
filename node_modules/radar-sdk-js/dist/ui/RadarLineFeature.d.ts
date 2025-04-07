import RadarMapFeature from './RadarMapFeature';
import type RadarMap from './RadarMap';
import type { RadarLineOptions, RadarPolylineOptions } from '../types';
declare class RadarLineFeature extends RadarMapFeature {
    constructor(map: RadarMap, feature: GeoJSON.Feature<GeoJSON.LineString>, lineOptions?: RadarLineOptions);
    static fromPolyline(map: RadarMap, polyline: string, polylineOptions?: RadarPolylineOptions): RadarLineFeature;
}
export default RadarLineFeature;

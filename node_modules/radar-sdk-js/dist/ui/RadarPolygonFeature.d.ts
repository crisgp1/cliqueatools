import RadarMapFeature from './RadarMapFeature';
import type RadarMap from './RadarMap';
import type { RadarPolygonOptions } from '../types';
declare class RadarPolygonFeature extends RadarMapFeature {
    constructor(map: RadarMap, feature: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>, polygonOptions?: RadarPolygonOptions);
}
export default RadarPolygonFeature;

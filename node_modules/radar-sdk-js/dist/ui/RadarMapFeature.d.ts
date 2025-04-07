import type RadarMap from './RadarMap';
type RadarFeatureEventType = 'click' | 'mousemove' | 'mouseenter' | 'mouseleave';
declare class RadarFeatureMouseEvent {
    type: RadarFeatureEventType;
    feature: RadarMapFeature;
    originalEvent: any;
    constructor(type: RadarFeatureEventType, feature: RadarMapFeature, originalEvent: any);
}
declare abstract class RadarMapFeature {
    id: string;
    geometry: GeoJSON.Geometry;
    properties: GeoJSON.GeoJsonProperties;
    _map: RadarMap;
    _feature: GeoJSON.Feature;
    _sourceIds: string[];
    _layerIds: string[];
    constructor(map: RadarMap, feature: GeoJSON.Feature);
    remove(): void;
    on(eventType: RadarFeatureEventType, callback: (event: RadarFeatureMouseEvent) => void): void;
}
export default RadarMapFeature;

import type { RadarTrackParams, RadarTrackResponse } from '../types';
declare class TrackAPI {
    static trackOnce(params: RadarTrackParams): Promise<RadarTrackResponse>;
}
export default TrackAPI;

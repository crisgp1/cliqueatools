import type { RadarTrackParams } from '../types';
declare class ConfigAPI {
    static getConfig(params?: RadarTrackParams): Promise<void>;
}
export default ConfigAPI;

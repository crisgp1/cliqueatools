import type { RadarContextResponse, Location } from '../types';
declare class ContextAPI {
    static getContext(location: Location): Promise<RadarContextResponse>;
}
export default ContextAPI;

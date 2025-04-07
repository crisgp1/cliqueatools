import type { RadarDistanceParams, RadarRouteResponse, RadarMatrixParams, RadarMatrixResponse } from '../types';
declare class RoutingAPI {
    static distance(params: RadarDistanceParams): Promise<RadarRouteResponse>;
    static matrix(params: RadarMatrixParams): Promise<RadarMatrixResponse>;
}
export default RoutingAPI;

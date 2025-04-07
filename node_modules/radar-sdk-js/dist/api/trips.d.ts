import type { RadarTripOptions, RadarTripStatus, RadarTripResponse } from '../types';
declare class TripsAPI {
    static setTripOptions(tripOptions?: RadarTripOptions): void;
    static getTripOptions(): RadarTripOptions;
    static clearTripOptions(): void;
    static startTrip(tripOptions: RadarTripOptions): Promise<RadarTripResponse>;
    static updateTrip(tripOptions: RadarTripOptions, status?: RadarTripStatus): Promise<RadarTripResponse>;
    static completeTrip(): Promise<RadarTripResponse>;
    static cancelTrip(): Promise<RadarTripResponse>;
}
export default TripsAPI;

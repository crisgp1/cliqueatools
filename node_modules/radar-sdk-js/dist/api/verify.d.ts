import type { RadarStartTrackingVerifiedParams, RadarTrackVerifiedParams, RadarTrackVerifiedResponse } from '../types';
declare class VerifyAPI {
    static trackVerified(params: RadarTrackVerifiedParams, encrypted?: Boolean): Promise<RadarTrackVerifiedResponse>;
    static startTrackingVerified(params: RadarStartTrackingVerifiedParams): void;
    static stopTrackingVerified(): void;
    static getVerifiedLocationToken(params: RadarTrackVerifiedParams): Promise<RadarTrackVerifiedResponse | null>;
    static clearVerifiedLocationToken(): void;
    static isLastTokenValid(): boolean | undefined;
    static setExpectedJurisdiction(countryCode?: string, stateCode?: string): void;
    static onTokenUpdated(callback: (token: RadarTrackVerifiedResponse) => void): void;
}
export default VerifyAPI;

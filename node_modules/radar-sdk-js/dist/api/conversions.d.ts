import type { RadarConversionParams, RadarConversionResponse } from '../types';
declare class ConversionsAPI {
    static logConversion(params: RadarConversionParams): Promise<RadarConversionResponse>;
}
export default ConversionsAPI;

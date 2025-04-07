import type { RadarValidateAddressParams, RadarValidateAddressResponse } from '../types';
declare class AddressesAPI {
    static validateAddress(params: RadarValidateAddressParams): Promise<RadarValidateAddressResponse>;
}
export default AddressesAPI;

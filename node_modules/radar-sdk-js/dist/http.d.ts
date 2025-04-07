export type HttpMethod = 'GET' | 'PUT' | 'PATCH' | 'POST' | 'DELETE';
interface HttpResponse {
    code: number;
    data: any;
}
declare class Http {
    static request({ method, path, data, host, version, headers, responseType, requestId, }: {
        method: HttpMethod;
        path: string;
        data?: any;
        host?: string;
        version?: string;
        headers?: Record<string, string>;
        responseType?: XMLHttpRequestResponseType;
        requestId?: string;
    }): Promise<HttpResponse>;
}
export default Http;

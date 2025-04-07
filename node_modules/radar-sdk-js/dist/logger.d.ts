declare class Logger {
    static debug(message: string, options?: any): void;
    static info(message: string): void;
    static warn(message: string): void;
    static error(message: string): void;
}
export default Logger;

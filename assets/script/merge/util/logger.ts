
export class Logger {

  private static DEBUG_LOG:boolean = true;//打印

  static Init(isDebug:boolean){
    this.DEBUG_LOG = isDebug;
  }

  static debug(...args: any[]) {
    if (Logger.DEBUG_LOG) {
      console.log(...args);
    }
  }

  static info(...args: any[]) {
    console.log(...args);
  }

  static warn(...args: any[]) {
    if (Logger.DEBUG_LOG) {
      console.warn(...args);
    }
  }

  static error(...args: any[]) {
    console.error(...args);
  }

  static assert(assertion?: boolean, message?: string, ...optionalParams: any[]): void {
    if (Logger.DEBUG_LOG) {
      console.assert(assertion, message, ...optionalParams);
    }
  }
}

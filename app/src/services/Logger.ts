//
// Inspired by the Logz.io Node.js logging code:
//   https://github.com/logzio/logzio-nodejs/blob/master/lib/logzio-nodejs.js
// Additional inspiration from react-native-device-log:
//   https://github.com/olofd/react-native-device-log/blob/master/debug-service.js
//

import Moment from 'moment';
import fetch from 'react-native-fetch-polyfill';
import { AppState, NetInfo, ConnectionInfo } from 'react-native';
import SleepUtil from './SleepUtil';

export enum LogLevel {
  Trace = 'trace',
  Debug = 'debug',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  None = 'none',
}

export class LogOptions {
  logzToken?: string = '';
  logzType?: string = 'rn';
  sendIntervalMs?: number = 2000;
  bufferSize?: number = 100;
  timeoutMs?: number = 10000;
  protocol?: string = 'https';
  level?: LogLevel = LogLevel.Info;
  toConsole?: boolean = false;
  deviceId?: string = '';
  bundleId?: string = '';
  logAppState?: boolean = false;
  logNetState?: boolean = false;
  logRNErrors?: boolean = false;
}

export default class Logger {
  private static _theLogger: Logger;
  private urlBase = 'https://listener.logz.io:8071/';
  private messages: Array<any>;
  private closed: boolean = false;
  private hasBeenDisconnected: boolean = false;
  private hasConnectionBeenEstablished: boolean = false;
  private options: LogOptions;
  // @ts-ignore
  private timer: number = -1;
  private levelStatuses: { [level: string]: boolean };

  public static CreateLogger(options: LogOptions) {
    if (Logger._theLogger !== undefined) {
      // This should only be called once
      return;
    }

    // Create the logger
    // tslint:disable-next-line:no-unused-expression
    new Logger(options);
  }

  //
  // Static helper functions (fetch the instance for the caller)
  //

  public static trace(message: (string | any)) {
    Logger.instance.log(LogLevel.Trace, message);
  }

  public static debug(message: (string | any)) {
    Logger.instance.log(LogLevel.Debug, message);
  }

  public static info(message: (string | any)) {
    Logger.instance.log(LogLevel.Info, message);
  }

  public static warning(message: (string | any)) {
    Logger.instance.log(LogLevel.Warning, message);
  }

  public static error(message: (string | any)) {
    Logger.instance.log(LogLevel.Error, message);
  }

  //
  // Private static helpers
  //

  private static addTimeStamp(msg: any) {
    msg['@timestamp'] = msg['@timestamp'] || (new Date()).toISOString();
  }

  private static safeObjectToJSON(input: any): string {
    try {
      return JSON.stringify(input);
    } catch (error) {
      console.log(`Logger - Exception serializing log messages: ${error}`);
      return '';
    }
  }

  //
  // Public interface
  //

  public log(level: LogLevel, message: (string | any)) {
    // Wrap a string with an Object
    if (typeof message === 'string') {
      message = { message: message };
    }

    if (this.levelStatuses[level] === true) {
      if (this.options.toConsole) {
        console.log(`${Moment().format('HH:mm:ss.SS')} - ${level.toString()} - ${message.message}`);
      }
      message.level = level.toString();
      this.logInternal(message);
    }
  }

  public trace(message: (string | any)) {
    this.log(LogLevel.Trace, message);
  }

  public debug(message: (string | any)) {
    this.log(LogLevel.Debug, message);
  }

  public info(message: (string | any)) {
    this.log(LogLevel.Info, message);
  }

  public warning(message: (string | any)) {
    this.log(LogLevel.Warning, message);
  }

  public error(message: (string | any)) {
    this.log(LogLevel.Error, message);
  }

  //
  // Private helpers
  //

  private constructor(options: LogOptions) {
    this.messages = new Array<any>();
    this.options = new LogOptions();
    for (let prop in options) {
      if (options.hasOwnProperty(prop)) {
        this.options[prop] = options[prop];
      }
    }
    this.setupEnabledLevels(options.level);
    this.periodicUploaderAsync = this.periodicUploaderAsync.bind(this);
    Logger._theLogger = this;

    if (this.options.logNetState) {
      NetInfo.addEventListener('connectionChange', this.netInfoConnectionChange.bind(this));
    }

    if (this.options.logAppState) {
      AppState.addEventListener('change', this.appStateChange.bind(this));
    }

    if (this.options.logRNErrors) {
      this.setupRNErrorLogging();
    }

    // Start the periodic uploads if Logz.io token was provided
    if (this.options.logzToken && this.options.logzToken !== '') {
      this.periodicUploaderAsync();
    }
  }

  private setupEnabledLevels(level: LogLevel) {
    switch (level) {
      case LogLevel.None:
        this.levelStatuses = { 'error': false, 'warning': false, 'info': false, 'debug': false, 'trace': false };
        break;
      case LogLevel.Error:
        this.levelStatuses = { 'error': true, 'warning': false, 'info': false, 'debug': false, 'trace': false };
        break;
      case LogLevel.Warning:
        this.levelStatuses = { 'error': true, 'warning': true, 'info': false, 'debug': false, 'trace': false };
        break;
      case LogLevel.Info:
        this.levelStatuses = { 'error': true, 'warning': true, 'info': true, 'debug': false, 'trace': false };
        break;
      case LogLevel.Debug:
        this.levelStatuses = { 'error': true, 'warning': true, 'info': true, 'debug': true, 'trace': false };
        break;
      case LogLevel.Trace:
        this.levelStatuses = { 'error': true, 'warning': true, 'info': true, 'debug': true, 'trace': true };
        break;
      default:
        this.levelStatuses = { 'error': true, 'warning': true, 'info': false, 'debug': false, 'trace': false };
    }
  }

  private async periodicUploaderAsync() {
    while (true) {
      if (this.messages.length > 0) {
        console.log(`Logger.periodicUploader - Sending ${this.messages.length} messages`);
        await this.sendAsync();
      }

      await SleepUtil.SleepAsync(this.options.sendIntervalMs);
    }
  }

  private logInternal(msg: any) {
    if (this.closed) {
      throw new Error('Logger is already closed');
    }

    // TODO: Copy extraFields if needed

    Logger.addTimeStamp(msg);

    // Add device id, if specified
    if (this.options.deviceId && this.options.deviceId.length > 0) {
      msg.deviceId = this.options.deviceId;
    }

    // Add bundle id, if specified
    if (this.options.bundleId && this.options.bundleId.length > 0) {
      msg.bundleId = this.options.bundleId;
    }

    if (msg && msg !== '') {
      this.messages.push(msg);
    }

    // Check if it's time to send
    if (this.messages.length >= this.options.bufferSize) {
      // this.debug('Logger - Buffer is full, sending messages');
      this.sendAsync();
    }
  }

  private payload(): string {
    let payload = '';

    for (let i = 0; i < this.messages.length; i++) {
      let message = Logger.safeObjectToJSON(this.messages[i]);
      if (message === '') continue;
      payload += message + '\n';
    }

    return payload;
  }

  private async sendAsync() {
    try {
      // Bail if we're not configured for upload
      if (!this.options.logzToken || this.options.logzToken === '') {
        // Clear the buffer
        this.messages = new Array<any>();
        return;
      }

      const payload = this.payload();

      // Blank out the pending messages
      this.messages = new Array<any>();

      const headers: { [id: string]: string } = {
        'Accept': '*/*',
        'Content-Type': 'text/plain',
      };

      const url = this.urlBase + `?token=${encodeURIComponent(this.options.logzToken)}&type=${encodeURIComponent(this.options.logzType)}`;

      /* if  (this.options.deviceId.length > 0) {
          url += `&deviceId=${encodeURIComponent(this.options.deviceId)}`;
      } */

      // Send the request
      const result = (await fetch(url, {
        method: 'POST',
        headers: headers,
        body: payload,
        // timeout: this.options.timeoutMs,
      })) as Response;

      // TODO: Eventually care about retrying if it fails...
      // NOTE: This just drops a chunk of logs on the floor if the upload fails

      if (!result.ok) {
        console.log(`Logger - Response not ok: ${result.status}`);
      } else {
        console.log('Logger - Upload appears to have worked');
      }
    } catch (error) {
      console.log(`Logger - Exception during upload: ${JSON.stringify(error)}`);
    }
  }

  //
  // Private handlers for NetInfo, AppState, RN Errors
  //

  private netInfoConnectionChange(info: ConnectionInfo) {
    // NOTE: NetInfoReturnType is really just an OR of string constants
    // NOTE: Android returned none as 'NONE' while iOS returns none as 'none', etc.
    let infoCaps = info.type.toUpperCase();
    if (infoCaps === 'NONE') {
      this.hasBeenDisconnected = true;
      this.log(LogLevel.Info, 'NetInfo - Disconnected');
    } else {
      if (this.hasBeenDisconnected) {
        this.hasBeenDisconnected = false;
        this.log(LogLevel.Info, `NetInfo - Reconnected: ${JSON.stringify(info)}`);
      } else {
        if (this.hasConnectionBeenEstablished) {
          this.log(LogLevel.Info, `NetInfo - Changed: ${JSON.stringify(info)}`);
        } else {
          this.log(LogLevel.Info, `NetInfo - Connection: ${JSON.stringify(info)}`);
        }
      }
      this.hasConnectionBeenEstablished = true;
    }
  }

  private async appStateChange(currentAppState: string) {
    this.log(LogLevel.Info, `AppState - Changed: ${currentAppState}`);
  }

  private setupRNErrorLogging() {
    if (!ErrorUtils) return;

    const defaultHandler = ErrorUtils.getGlobalHandler();

    if (defaultHandler) {
      ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
        // TODO: Parse the error stack, if desired
        this.RNError(isFatal, error.message);
        if (defaultHandler) defaultHandler(error, isFatal);
      });
    }
  }

  private RNError(fatal: boolean, message: string) {
    if (fatal) {
      this.error(`RNFatal - ${message}`);
    } else {
      this.error(`RNError - ${message}`);
    }
  }

  //
  // Public static interface
  //

  public static get instance(): Logger {
    return Logger._theLogger;
  }
}
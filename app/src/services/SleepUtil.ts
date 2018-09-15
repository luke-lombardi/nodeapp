import { NativeModules } from 'react-native';

// @ts-ignore
import Logger from './Logger';

export default class SleepUtil {
  // static async SleepAsync(ms: number = 0) {
  //   return new Promise(r => setTimeout(r, ms));
  // }

  static async SleepAsync(ms: number = 0) {
    let NativeSleep = NativeModules.NativeSleep;
    let seconds = ms / 1000.0;

    // Logger.info(`SleepUtil.SleepAsync - Sleeping for ${seconds} seconds`);
    await NativeSleep.SleepAsync(seconds);
    // Logger.info(`SleepUtil.SleepAsync - Done Sleeping ${res}`);
  }
}
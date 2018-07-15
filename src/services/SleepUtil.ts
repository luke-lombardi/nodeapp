export default class SleepUtil {
  static async SleepAsync(ms: number = 0) {
    return new Promise(r => setTimeout(r, ms));
  }
}
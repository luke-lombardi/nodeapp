// NativeSleep.m
#import "NativeSleep.h"
#import <React/RCTLog.h>

@implementation NativeSleep

// To export a module named NativeSleep (if you passed a name to this method, it would be called that instead)
RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(SleepAsync,
                 secondsToSleep:(double) secondsToSleep
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
      // Pause thread
      @try {
        [NSThread sleepForTimeInterval:secondsToSleep];
        resolve(@"done_sleeping");
      }
      @catch (NSException *exception) {
        NSError *error = [NSError errorWithDomain:@"io.smartshare.app" code:-1 userInfo:@{@"Error reason": @"Unknown"}];
        NSLog(@"%@",error);
        reject(@"error_sleeping", @"Could not pause the thread", error);
      }
  });
  
}
@end

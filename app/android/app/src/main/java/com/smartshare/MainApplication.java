package com.smartshare;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.azendoo.reactnativesnackbar.SnackbarPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactlibrary.RNSimpleCompassPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.devfd.RNGeocoder.RNGeocoderPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.microsoft.codepush.react.CodePush;
import org.reactnative.camera.RNCameraPackage;
import com.airlabsinc.RNAWSCognitoPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected String getJSBundleFile() {
        return CodePush.getJSBundleFile();
        }
    
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNGestureHandlerPackage(),
            new BlurViewPackage(),
            new SnackbarPackage(),
            new VectorIconsPackage(),
            new RNSimpleCompassPackage(),
            new RandomBytesPackage(),
            new MapsPackage(),
            new LinearGradientPackage(),
            new RNGeocoderPackage(),
            new ReactNativeContacts(),
            new CodePush(getResources().getString(R.string.reactNativeCodePush_androidDeploymentKey), getApplicationContext(), BuildConfig.DEBUG),
            new RNCameraPackage(),
            new RNAWSCognitoPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}

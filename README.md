## Setting up dev environment

##### Clone the repo and run the following:

1. **Install node modules**: `cd` into `./app` and run `npm install` 

2. **Patch assets**: From `./app` run `code node_modules/metro/src/defaults.js` and add `vrx` and `obj` to the exports.assetExts list
 
3.  **Install PODS**:   From `./app/ios` run `pod install`

4.  **Create bundle**: From `./app` run `npm run ios:start` 

5. **Install to device**: You can now open up the `./app/ios/Smartshare.xcworkspace` file and install the debug build to your phone (or run it in the simulator)

---
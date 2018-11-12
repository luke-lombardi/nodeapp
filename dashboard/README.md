## Athlete management app

##### Organization:

The src folder is broken up into the following subdirectories:

- **actions** - Redux action defintions
- **components** - React components, e.g. athlete list, editor, etc.
- **reducers** - Redux reducer definitions
- **services** - Background services used by the app, for example ApiService for making api calls
- **store** - Definition of redux state
- **styles** - Plain css styles used by various components

---

**Configuration**: Global configuration variables are loaded by ./services/config/ConfigGlobal.ts

Some notes:

- The way this is currently set up, the athlete list is populated by a monitoring loop (MonitorAthletesAsync), which is a member of ApiService.ts. The rate at which this list is polled is defined in src/ConfigGlobalDebug.json, or src/ConfigGlobalRelease.json

- Currently to get this to run w/ the local docker API running, you need this chrome plugin: https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi


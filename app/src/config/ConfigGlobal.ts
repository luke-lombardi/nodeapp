import globalConfigDebug from '../ConfigGlobalDebug.json';
import globalConfigRelease from '../ConfigGlobalRelease.json';

export interface ConfigGlobal {
    readonly apiServicesUrlBase: string;
    readonly apiStage: string;

    readonly nodeCheckIntervalMs: number;
    readonly groupCheckIntervalMs: number;
    readonly messageCheckIntervalMs: number;

    readonly jsVersion: string;
    readonly buildEnvironment: string;
}

//
// NOTE: The global config file is static and compiled into the JS bundle.
// Because the file is included in the bundle, as code, it's loading is synchronous and immediate,
// not async.  This makes the global config a little easier to work with than if it was opened
// as a user file.
//

export class ConfigGlobalLoader {
    private static configGlobal: ConfigGlobal;

    private static Load(): ConfigGlobal {
        let config: ConfigGlobal;
        if (__DEV__) {
            config = globalConfigDebug;
        } else {
            config = globalConfigRelease;
        }
        return config;
    }

    public static get config(): ConfigGlobal {
        if (ConfigGlobalLoader.configGlobal === undefined) {
            ConfigGlobalLoader.configGlobal = ConfigGlobalLoader.Load();
        }
        return ConfigGlobalLoader.configGlobal;
    }
}
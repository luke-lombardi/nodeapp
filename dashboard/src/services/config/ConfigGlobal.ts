import { default as globalConfigDebug } from '../../ConfigGlobalDebug';
import { default as globalConfigRelease } from '../../ConfigGlobalRelease';

export interface ConfigGlobal {
    readonly jsVersion: string;
    readonly buildEnvironment: string;
    readonly apiUrlBase: string;
    readonly apiStage: string;
    readonly nodeUpdateIntervalMS: number;
    readonly rootPath: string;
    readonly authUrl: string;
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
        if (process.env.NODE_ENV === 'development') {
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
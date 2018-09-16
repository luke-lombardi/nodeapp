import json
import subprocess
import sys
from collections import OrderedDict


def load_build_config(currentAPI):
    with open('./endpoints/' + currentAPI + '/build_config.json', 'r') as f_in:
        build_config = json.load(f_in, object_pairs_hook=OrderedDict)
    return build_config


def run():
    try:
        currentAPI = sys.argv[1]
    except:
        print('Usage: ./build ENDPOINT_NAME')
        return

    buildConf = load_build_config(currentAPI)
    configPrefix = buildConf.get('CONFIG_PREFIX', '')
    outputPath = currentAPI

    buildEnv = {
        'CURRENT_API': currentAPI,
        'CONFIG_PREFIX': configPrefix,
        'OUTPUT_PATH': outputPath
    }

    conf = OrderedDict(buildConf.get('BUILD', {}))
    if conf:
        for step, cmd in conf.items():
            print('Running step: ' + step)
            subprocess.call(cmd, shell=True, env=buildEnv)

        print('Finished building, deployment package available in: ./deployment_packages/' + outputPath + '.zip')


if __name__ == '__main__': run()
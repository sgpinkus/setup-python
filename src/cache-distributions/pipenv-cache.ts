import * as glob from '@actions/glob';
import * as os from 'os';
import * as path from 'path';
import * as core from '@actions/core';

import CacheDistributor from './cache-distributor';

class PipenvCache extends CacheDistributor {
  protected readonly packageManager = 'pipenv';

  constructor(
    private pythonVersion: string,
    protected readonly cacheDependencyPath: string = '**/Pipfile.lock'
  ) {
    super();
  }

  protected async getCacheGlobalDirectories() {
    let virtualEnvRelativePath;

    // Default virtualenv directories are hardcoded,
    // because pipenv is not preinstalled on hosted images and virtualenv is not created:
    // https://github.com/pypa/pipenv/blob/1daaa0de9a0b00d386c6baeb809d8d4ee6795cfd/pipenv/utils.py#L1990-L2002
    if (process.platform === 'win32') {
      virtualEnvRelativePath = '.virtualenvs';
    } else {
      virtualEnvRelativePath = '.local/share/virtualenvs';
    }
    const resolvedPath = path.join(os.homedir(), virtualEnvRelativePath);
    core.debug(`global cache directory path is ${resolvedPath}`);

    return [resolvedPath];
  }

  protected async computeKeys() {
    const hash = await glob.hashFiles(this.cacheDependencyPath);
    const primaryKey = `${this.CACHE_KEY_PREFIX}-${process.env['RUNNER_OS']}-${process.arch}-python-${this.pythonVersion}-${this.packageManager}-${hash}`;
    const restoreKey = undefined;
    return {
      primaryKey,
      restoreKey,
      cacheDependencyPath: this.cacheDependencyPath,
    };
  }
}

export default PipenvCache;

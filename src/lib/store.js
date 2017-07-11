'use strict';
// Many thanks to https://medium.com/@ccnokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
// for writing the basis of this code.

const electron = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

class Store {
  constructor(opts) {
    opts = opts || {};
    if (!opts.configName) throw new Error('Must supply a configName.')
    const configName = opts.configName;
    const defaults = opts.defaults = opts.defaults || {};

    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
    this.path = path.join(userDataPath, configName + '.json');

    this.data = parseDataFile(this.path, defaults);
  }

  // This will just return the property on the `data` object
  get(key) {
    return this.data[key];
  }

  // ...and this will set it
  set(key, val) {
    this.data[key] = val;
    // Wait, I thought using the node.js' synchronous APIs was bad form?
    // We're not writing a server so there's not nearly the same IO demand on the process
    // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
    // we might lose that data. Note that in a real app, we would try/catch this.
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

class ModuleStore extends Store {
  constructor(opts) {
    super(opts);
  }

  /**
   * Reduces the data object into an array.
   * @return {Array}
   */
  list() {
    return Object.keys(this.data).reduce((acc, key) => acc.concat([this.data[key]]), []);
  }

  /**
   * Seeds the store's data with the static list of modules shipped with the app.
   * @return {undefined}
   */
  seed() {
    const appPath = (electron.app || electron.remote.app).getAppPath();
    const moduleDataPath = path.join(appPath, 'src', 'data', 'modules.json');
    const modules = require(moduleDataPath);

    for (let moduleData of modules) {
      let moduleName = moduleData.name;
      let cachedData = this.get(moduleName) || {};
      let defaults = {
        name: moduleName,
        githubUrl: `https://github.com/predixdev/${moduleName}`,
        lastVersionCheck: undefined,
        latestVersion: undefined,
        allVersions: [],
        builtVersions: []
      };
      let updatedData = Object.assign({}, defaults, cachedData, moduleData);
      this.set(moduleName, updatedData);
    }
  }

  /**
   * Goes out to the Github API and fetches info about a module. Returns a promise
   * that resolves with the module data when the fetch is finished.
   * @param {String} moduleName
   * @return {Promise.<Object>}
   */
  getInfo(moduleName) {
    return new Promise((resolve, reject) => {
      let cachedData = this.get(moduleName);
      if (!cachedData) return reject();

      if (!cachedData.allVersions.length) {
        return getTags('PredixDev', moduleName)
          .then(resp => {
            cachedData.allVersions = resp.data;
            this.set(moduleName, cachedData);
            return resolve(cachedData);
          })
      }
      return resolve(cachedData);
    });
  }
}

function parseDataFile(filePath, defaults) {
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    // if there was some kind of error, return the passed in defaults instead.
    return defaults;
  }
}

function createModuleStore(opts) {
  return new ModuleStore(opts);
}

function getTags(org, repo) {
  let url = `https://api.github.com/repos/${org}/${repo}/tags`
  return axios.get(url);
}

// expose the class
module.exports = {
  Store,
  createModuleStore
};

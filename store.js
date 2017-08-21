'use strict';

/*
 * Thanks to the blog post https://medium.com/@ccnokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
 * by Cameron Nokes for the original version of this simple store module.
 */

const electron = require('electron');
const path = require('path');
const fs = require('fs');

class Store {
  /**
   * Creates a new store to persist data during and across user sessions.
   * @param  {String} name - The name of the store, used to save data to disk
   * @param  {Object} opts - Unused, reserved for the future
   */
  constructor(name, opts) {
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    // We'll use the `name` property to set the file name and path.join to bring it all together as a string
    this.path = path.join(userDataPath, '__STORE__' + name + '.json');

    this.data = parseDataFile(this.path);
  }

  /**
   * Returns the property from the store, or the default if undefined.
   * @param  {String} key
   * @param  {*}      defaultVal
   * @return {*}
   */
  get(key, defaultVal) {
    if (typeof this.data[key] === 'undefined') {
      return defaultVal;
    } else {
      return this.data[key];
    }
  }

  // ...and this will set it
  /**
   * Sets the property in the store. If `val` is undefined, deletes the
   * property from the store.
   * @param {String} key
   * @param {*}      val
   */
  set(key, val) {
    if (typeof val === 'undefined' && this.data[key] !== 'undefined') {
      delete this.data[key];
    } else {
      this.data[key] = val;
    }
    // Wait, I thought using the node.js' synchronous APIs was bad form?
    // We're not writing a server so there's not nearly the same IO demand on the process
    // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
    // we might lose that data. Note that in a real app, we would try/catch this.
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(filePath) {
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    // if there was some kind of error, return an empty object
    return {};
  }
}

// expose the class
module.exports = Store;

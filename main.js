'use strict';

const electron = require('electron');
const ipcMain = electron.ipcMain;
const clipboard = electron.clipboard;
const menubar = require('menubar');

const mb = menubar({
  'node-integration' : true
});

mb.on('ready', function ready() {
  console.log('app is ready')
});

mb.on('after-create-window', function afterCreateWindow() {
  // mb.window.openDevTools();
  // let html = mb.window.webContents;
  // html.openDevTools({mode: 'detach'});
  // html.on('dom-ready', () => {
  //   html.executeJavaScript(`
  //     require('electron').ipcRenderer.send('ping');
  //   `);
  // });
});

mb.on('after-show', function afterShow() {
  let html = mb.window.webContents;
  html.send('after-show');
});

ipcMain.on('copy-to-clipboard', (evt, detail) => {
  console.log(`Copying the following to clipboard: ${detail}`);
  clipboard.writeText(detail);
});

ipcMain.on('quit', (evt, detail) => {
  console.log(`Quit requested. Quitting now.`);
  mb.app.quit();
});

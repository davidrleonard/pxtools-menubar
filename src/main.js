'use strict';

const path = require('path');
const electron = require('electron');
const ipcMain = electron.ipcMain;
const clipboard = electron.clipboard;
const menubar = require('menubar');

const mb = menubar({
  'node-integration' : true,
  alwaysOnTop: true,
  dir: path.join(__dirname, 'src'),
  icon: path.join(__dirname, 'electron', 'icon.png'),
  index: 'file://' + path.join(__dirname, 'client', 'index.html')
});

console.log(process.cwd())

mb.on('ready', function ready() {
  console.log('app is ready')
});

mb.on('after-create-window', function afterCreateWindow() {
  mb.window.openDevTools();
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

ipcMain.on('build-module-docs', (evt, detail) => {
  console.log(`Preparing to build: ${detail}`);

});

ipcMain.on('serve-module-docs-start', (evt, detail) => {
  console.log(`Starting HTTP server for: ${detail}`);

});

ipcMain.on('serve-module-docs-stop', (evt, detail) => {
  console.log(`Starting HTTP server for: ${detail}`);

});

ipcMain.on('quit', (evt, detail) => {
  console.log(`Quit requested. Quitting now.`);
  mb.app.quit();
});

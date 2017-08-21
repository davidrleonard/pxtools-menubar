'use strict';

const electron = require('electron');
const {ipcMain, clipboard, Menu} = electron;
const menubar = require('menubar');
const Store = require('./store');
const settings = new Store('settings');

const mb = menubar({
  'node-integration' : true,
  alwaysOnTop: true
});

const app = mb.app;

mb.on('ready', function ready() {
  console.log('app is ready');

  // Creates an application "menu", even though we'll never see it since we're
  // in tray app mode. Necessary to enable copy/paste on OSX:
  // https://pracucci.com/atom-electron-enable-copy-and-paste.html
  const template = [
    {
      label: "Application",
      submenu: []
    },
    {
      label: "Edit",
      submenu: [
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
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

mb.on('focus-lost', function focusLost() {
  const pinned = settings.get('pinned', false);
  if (!pinned) {
    mb.hideWindow();;
  }
});

ipcMain.on('copy-to-clipboard', (evt, detail) => {
  console.log(`Copying the following to clipboard: ${detail}`);
  clipboard.writeText(detail);
});

ipcMain.on('quit', (evt, detail) => {
  console.log(`Quit requested. Quitting now.`);
  mb.app.quit();
});

ipcMain.on('update-settings', (evt, updatedSettings) => {
  console.log(`Updating settings: ${JSON.stringify(updatedSettings, null, '  ')}`);
  let keys = Object.keys(updatedSettings);
  for (let key of keys) {
    settings.set(key, updatedSettings[key]);
  }
});

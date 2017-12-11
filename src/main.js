const {app, BrowserWindow, ipcMain} = require('electron')
const menubar = require('menubar')


let mainWindow
let pickerDialog
let mb = menubar({
  icon: 'IconTemplate.png',
  width:380,
  height:350,
  dir: process.cwd() + '/src',
  tooltip: 'Electron screen recorder',
  preloadWindow: true,
  // alwaysOnTop -> keep the menubar window opened (for debug only)
  // alwaysOnTop: true
})


mb.on('ready', () => {
  // Opens the chrome dev tools at launch for debug
  // mb.window.openDevTools()

  pickerDialog = new BrowserWindow({
    parent: mainWindow,
    skipTaskbar: true,
    modal: true,
    show: false,
    height: 390,
    width: 680
  })
  pickerDialog.loadURL('file://' + __dirname + '/picker.html')
});

ipcMain.on('show-picker', (event, options) => {
  pickerDialog.show()
  pickerDialog.webContents.send('get-sources', options)
})

ipcMain.on('source-id-selected', (event, sourceId) => {
  pickerDialog.hide()
  mb.window.webContents.send('source-id-selected', sourceId)
})

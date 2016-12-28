const {app, BrowserWindow} = require('electron')

let mainWindow

app.on('ready', () => {
  mainWindow = new BrowserWindow({
      height: 320,
      width: 500
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html')
});

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
// Assuming Firebase is used in preload or renderer
const firebase = require('firebase/app');
require('@firebase/firestore');

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Protect against prototype pollution
      enableRemoteModule: false, // Turn off remote
      nodeIntegration: false, // Do not enable node integration directly in renderer processes
    }
  });

  // Load index.html into the new BrowserWindow
  mainWindow.loadFile('index.html');

  // Prompt the user before closing the window
  mainWindow.on('close', (e) => {
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Si', 'No'],
      title: 'Salida',
      message: '¿Seguro que quieres cerrar? Perderías alertas.'
    });
    if (choice !== 0) {
      e.preventDefault();
    }
  });
}

// This event will be emitted when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar
// to stay active until the user quits explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('bringToFront', () => {
  if (mainWindow && mainWindow.isMinimized()) mainWindow.restore();
  mainWindow?.focus();
});

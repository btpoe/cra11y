const { app, BrowserWindow, ipcMain } = require('electron');
const isDevMode = require('electron-is-dev');

const path = require('path');
const puppeteer = require('puppeteer');

const webpage = require('./browser');
const AsyncPool = require('./utils/AsyncPool');

// Place holders for our windows so they don't get garbage collected.
let mainWindow = null;

// shared browser instance for all pages
let browser;

// Create simple menu for easy devtools access, and for demo
// const menuTemplateDev = [
//   {
//     label: 'Options',
//     submenu: [
//       {
//         label: 'Open Dev Tools',
//         click() {
//           mainWindow.openDevTools();
//         },
//       },
//     ],
//   },
// ];

async function createWindow () {
  // Define our main window size
  mainWindow = new BrowserWindow({
    height: 920,
    width: 1600,
    show: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadURL(
    isDevMode ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`
  );

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.show();
  });

  if (!browser) {
    browser = await puppeteer.launch({
      args: ['--no-sandbox']
    });
  }

  if (isDevMode) {
    // Set our above template to the Menu Object if we are in development mode, dont want users having the devtools.
    // Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplateDev));
    // If we are developers we might as well open the devtools by default.
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  browser.close();
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

const pool = new AsyncPool(10);

// Define any IPC or other custom functionality below here
ipcMain.on('crawl-async', async (event, arg) => {
  let response = null;

  try {
    response = await pool.add(() => webpage(browser, arg));
  } catch (e) {
    event.sender.send('crawl-fail', { url: arg.url });
  }

  // responses after the pool is flushed are `null`
  if (response) {
    event.sender.send('crawl-reply', { url: arg.url, response })
  }
});

// Define any IPC or other custom functionality below here
ipcMain.on('crawl-flush', async () => {
  pool.flush();
});

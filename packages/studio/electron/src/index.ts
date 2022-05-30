import { app, BrowserWindow } from 'electron'
import { v4 as uuidv4 } from 'uuid'

if (app.isPackaged) {
  require('./server.js')
}

const id = uuidv4()
// eslint-disable-next-line no-console
console.log('bonjour', id)

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  })

  if (app.isPackaged) {
    void mainWindow.loadFile('index.html')
  } else {
    void mainWindow.loadURL('http://localhost:1234')
  }

  mainWindow.webContents.openDevTools()
}

void app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

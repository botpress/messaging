import { app, BrowserWindow } from 'electron'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const id = uuidv4()
// eslint-disable-next-line no-console
console.log('test external dep : ', id)

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  void mainWindow.loadURL('http://localhost:1234/studio/gggg')

  // mainWindow.webContents.openDevTools()
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

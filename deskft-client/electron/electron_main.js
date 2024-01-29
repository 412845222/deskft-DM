const { app, BrowserWindow,Menu } = require('electron')
const path = require('path')
const { BLiveRoom } = require('./BLiveRoom/index.js')

const bliveRoom = new BLiveRoom()

const createWindow = () => {
  // 创建浏览窗口
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    resizable: false,
    icon: path.join(__dirname, './imgs/Dweb.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    }
  })

  // 隐藏默认菜单
  Menu.setApplicationMenu(null);

  // mainWindow.setAlwaysOnTop(true)

  // 加载 index.html
  mainWindow.loadFile(path.join(__dirname, './dist/index.html'))
  // mainWindow.loadURL('http://localhost:5173')
  // mainWindow.loadFile('./dist/index.html')

  // 打开开发工具
  // mainWindow.webContents.openDevTools()
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    // 在 macOS 系统内, 如果没有已开启的应用窗口
    // 点击托盘图标时通常会重新创建一个新窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('ready', () => {
  console.log('ready')
  // 获取启动参数
  const argv = process.argv;
  // 在控制台打印所有启动参数
  console.log('Command line arguments:', argv);
  // -room_id=1202003 code=C4NV772H0WZK6
  // 在启动参数中查找 --room_id
  const roomIdArgIndex = argv.findIndex(arg => arg.startsWith('-room_id='));
  if (roomIdArgIndex !== -1) {
    // 找到了 --room_id 参数
    const roomId = argv[roomIdArgIndex].split('=')[1];
    console.log('Room ID:', roomId);
    bliveRoom.room_id = roomId
  }
  // 在启动参数中查找 code
  const codeArgIndex = argv.findIndex(arg => arg.startsWith('code='));
  if (codeArgIndex !== -1) {
    // 找到了 --room_id 参数
    const code = argv[codeArgIndex].split('=')[1];
    console.log('code:', code);
    bliveRoom.code = code
  }
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常
// 对应用程序和它们的菜单栏来说应该时刻保持激活状态,
// 直到用户使用 Cmd + Q 明确退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
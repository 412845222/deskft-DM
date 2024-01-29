//preload.js
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

const { ipcRenderer,contextBridge } = require('electron')

contextBridge.exposeInMainWorld("BLiveRoom",{
  send:(msg)=>{
    ipcRenderer.send('BLiveRoom',msg)
  },
  onec:(channel,callback)=>{
    ipcRenderer.once(channel,(event,arg)=>{
      console.log("preload.js:ipcRenderer.once")
      // console.log(arg)
      callback(arg)
    })
  }
})

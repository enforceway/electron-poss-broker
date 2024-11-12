import EleLog from "electron-log/renderer"
import IpcDict from "@/constants/ipc-dict"

EleLog.transports.console.format = `[{y}-{m}-{d} {h}:{i}:{s}.{ms}] => {text}`

if (process.platform === "win32") {
  Object.assign(console, EleLog.functions)
} else {
  Object.keys(EleLog.functions).forEach((fn) => {
    if (fn in console) {
      console[fn] = function (...params: any[]) {
        window.vIpcRenderer.send(IpcDict.CODE_02001, "console", ...params)
      }
    }
  })
}

// window.vRemote = require("@electron/remote")
window.vIpcRenderer = require("electron")["ipcRenderer"]
window.vLog = (logName: string, ...params: any[]) => {
  window.vIpcRenderer.send(IpcDict.CODE_02001, logName, ...params)
}


document.addEventListener('DOMContentLoaded', () => {
  const ipcRenderer = require('electron').ipcRenderer;

  ipcRenderer.on('cpu-usage', (event, cpuUsage) => {
    console.log(`CPU 使用率: ${JSON.stringify(cpuUsage)} (用户), ${cpuUsage.system}% (系统)`);
    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
  });
});
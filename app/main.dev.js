/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import {
  app,
  autoUpdater,
  BrowserWindow,
  dialog
  // globalShortcut,
  // ipcMain
  // Notification
} from "electron";
const isDev = require("electron-is-dev");
const log = require("electron-log");
Object.assign(console, log.functions); //replace console with file logging in the main process

// import { store, axios } from "./utils/singleton.js";
import MenuBuilder from "./menu";

//Constants
const APP_NAME = "slingshow";
const AUTOUPDATE_SERVER_URL = `https://${APP_NAME}.now.sh`;

//Global Windows
let mainWindow = null;

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === "development" ||
  process.env.DEBUG_PROD === "true"
) {
  require("electron-debug")();
}

const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

async function createWindow(route) {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_PROD === "true"
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    acceptFirstMouse: true,
    resizable: false,
    movable: false,
    useContentSize: true,
    frame: false,
    show: false,
    width: 800,
    height: 450,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  //Using hash based routing
  if (route) {
    mainWindow.loadURL(`file://${__dirname}/app.html#${route}`);
  } else {
    mainWindow.loadURL(`file://${__dirname}/app.html`);
  }

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on("did-finish-load", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
    setupAutoUpdater();
  });

  mainWindow.on("unresponsive", () => {
    console.log("window crashed");
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // mainWindow.on("blur", () => {
  //   if (
  //     process.env.NODE_ENV === "production" &&
  //     process.env.DEBUG_PROD !== "true"
  //   ) {
  //     mainWindow.hide();
  //   }
  // });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
}

//Helper Functions
function createOrShowWindow(route = "/home") {
  if (mainWindow === null) {
    createWindow(route);
  } else {
    //sends window-refresh when you want to change the state and its alive
    mainWindow.webContents.send("window-refresh", route);
  }
  mainWindow.show();
  mainWindow.focus();
}

// function callUpdateNotification() {
//   const iconAddress = `file://${__dirname}/assets/logo.png`;
//   const notifOptions = {
//     title: "Slingshow",
//     // subtitle: "NOW",
//     body: "Time to update your team (⌘K)",
//     icon: iconAddress
//   };
//   const notif = new Notification(notifOptions);
//   notif.show();
//   notif.addListener("click", () => {
//     console.log("I hear the shit out of you");
//     createOrShowWindow();
//   });
// }

// App Settings

app.setLoginItemSettings({
  openAtLogin: false,
  openAsHidden: true
});

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("ready", () => {
  createWindow();
  // addToTray();

  // open and close with command K
  // globalShortcut.register("CommandOrControl+K", () => {
  //   if (!mainWindow) {
  //     createWindow();
  //   } else if (mainWindow.isVisible()) {
  //     mainWindow.hide();
  //   } else {
  //     mainWindow.show();
  //   }
  // });
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  createOrShowWindow();
});

// This will catch clicks on links such as <a href="slingshow://abc=1">open in slingshow</a>
//TODO: Dont wait for request, instead open window early.
//TODO: Potential Security Problem.....
// app.on("open-url", (event, data) => {
//   event.preventDefault();
//   //Assuming opens with token
//   const tokenID = data.split("://")[1];
//   axios
//     .post("/api/user/verify", { tokenID })
//     .then(resp => {
//       store.set(keys.USER, resp.data);
//       createOrShowWindow();
//     })
//     .catch(console.error);
// });

// app.setAsDefaultProtocolClient(APP_NAME);

//AUTOUPDATES,
function setupAutoUpdater() {
  if (!isDev) {
    console.log("Prepping autoupdater");
    const server = AUTOUPDATE_SERVER_URL;
    const feed = `${server}/update/${process.platform}/${app.getVersion()}`;
    console.log(`Checking: ${feed}`);

    autoUpdater.setFeedURL(feed);

    setInterval(() => {
      mainWindow.webContents.send(
        "console-log",
        "AUTOUPDATER: Checking for autoupdates"
      );
      autoUpdater.checkForUpdates();
    }, 60000); //check every minute

    autoUpdater.on("error", err => {
      console.log("AUTOUPDATER: errorrrr");
      console.log(err);
    });

    autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
      const dialogOpts = {
        type: "info",
        buttons: ["Restart", "Later"],
        title: "Application Update",
        message: process.platform === "win32" ? releaseNotes : releaseName,
        detail:
          "A new version has been downloaded. Restart the application to apply the updates."
      };

      dialog.showMessageBox(dialogOpts).then(returnValue => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall();
      });
    });
  }
}

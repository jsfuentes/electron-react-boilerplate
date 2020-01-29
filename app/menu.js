// @flow
import { app, Menu, shell, BrowserWindow } from "electron";

export default class MenuBuilder {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.DEBUG_PROD === "true"
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === "darwin"
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
    this.mainWindow.webContents.on("context-menu", (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: "Inspect element",
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        }
      ]).popup(this.mainWindow);
    });
  }

  buildDarwinTemplate() {
    const subMenuAbout = { role: "appMenu" };

    const subMenuEdit = {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "Command+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+Command+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "Command+X", selector: "cut:" },
        { label: "Copy", accelerator: "Command+C", selector: "copy:" },
        { label: "Paste", accelerator: "Command+V", selector: "paste:" },
        { role: "pasteAndMatchStyle" },
        { role: "selectAll" },
        { type: "separator" },
        {
          label: "Speech",
          submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }]
        }
      ]
    };

    // const subMenuHelp = {
    //   label: "Help",
    //   submenu: [
    //     {
    //       label: "Learn More",
    //       click() {
    //         shell.openExternal("http://electron.atom.io");
    //       }
    //     },
    //     {
    //       label: "Documentation",
    //       click() {
    //         shell.openExternal(
    //           "https://github.com/atom/electron/tree/master/docs#readme"
    //         );
    //       }
    //     },
    //     {
    //       label: "Community Discussions",
    //       click() {
    //         shell.openExternal("https://discuss.atom.io/c/electron");
    //       }
    //     },
    //     {
    //       label: "Search Issues",
    //       click() {
    //         shell.openExternal("https://github.com/atom/electron/issues");
    //       }
    //     }
    //   ]
    // };

    const template = [subMenuAbout, subMenuEdit];
    if (process.env.NODE_ENV === "development") {
      template.push({ role: "viewMenu" });
    }

    return template;
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: "&File",
        submenu: [
          {
            label: "&Open",
            accelerator: "Ctrl+O"
          },
          {
            label: "&Close",
            accelerator: "Ctrl+W",
            click: () => {
              this.mainWindow.close();
            }
          }
        ]
      },
      {
        label: "&View",
        submenu:
          process.env.NODE_ENV === "development"
            ? [
                {
                  label: "&Reload",
                  accelerator: "Ctrl+R",
                  click: () => {
                    this.mainWindow.webContents.reload();
                  }
                },
                {
                  label: "Toggle &Full Screen",
                  accelerator: "F11",
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  }
                },
                {
                  label: "Toggle &Developer Tools",
                  accelerator: "Alt+Ctrl+I",
                  click: () => {
                    this.mainWindow.toggleDevTools();
                  }
                }
              ]
            : [
                {
                  label: "Toggle &Full Screen",
                  accelerator: "F11",
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  }
                }
              ]
      },
      {
        label: "Help",
        submenu: [
          {
            label: "Learn More",
            click() {
              shell.openExternal("http://electron.atom.io");
            }
          },
          {
            label: "Documentation",
            click() {
              shell.openExternal(
                "https://github.com/atom/electron/tree/master/docs#readme"
              );
            }
          },
          {
            label: "Community Discussions",
            click() {
              shell.openExternal("https://discuss.atom.io/c/electron");
            }
          },
          {
            label: "Search Issues",
            click() {
              shell.openExternal("https://github.com/atom/electron/issues");
            }
          }
        ]
      }
    ];

    return templateDefault;
  }
}

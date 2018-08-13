electron.app.on('ready', () => {

    const mainWindow = new electron.BrowserWindow({
        minWidth: 800,
        minHeight: 480,
        width: 1024,
        height: 720,

        icon: __dirname + '/icons/64x64.ico'
    });

    mainWindow.setMenuBarVisibility(false);

    mainWindow.webContents.openDevTools();

    app.use(express.static('static'));
    
    mainWindow.loadURL(`http://localhost:${server.address().port}`);

});

electron.app.on('window-all-closed', () => {
    electron.app.quit();
});
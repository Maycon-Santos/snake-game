const { app, BrowserWindow } = require('electron');
const express = require('express');
const server = express();

const port = 3000;

app.on('ready', () => {

    server.use(express.static('app'));

    server.listen(port, () => {

        console.log(`Servidor rodando na porta ${port}`);

        let mainWindow = new BrowserWindow({
            width: 1024,
            height: 720
        });
    
        mainWindow.setMenuBarVisibility(false);
    
        mainWindow.webContents.openDevTools();
    
        mainWindow.loadURL(`http://localhost:${port}`);

    });

});

app.on('window-all-closed', () => {
    app.quit();
});
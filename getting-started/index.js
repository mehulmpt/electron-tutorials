const {BrowserWindow, app} = require('electron');
const url = require('url');

let win = null

function boot() {
	console.log(process.type)
	win = new BrowserWindow({
		width: 1000,
		height: 500,
		resizable: false
	})
	win.loadURL(`file://${__dirname}/index.html`)
}

app.on('ready', boot);
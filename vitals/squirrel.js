const path = require('path');
const { unregisterAtLogin, registerAtLogin } = require('./login');
const spawn = require('child_process').spawn;
const app = require('electron').app;

const run = (args, done) => {
    const updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
    spawn(updateExe, args, {
        detached: true
    }).on('close', done);
};

const isSquirrel = () => {
    if (process.platform === 'win32') {
        const cmd = process.argv[1];
        const target = path.basename(process.execPath);

        if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
            run(['--createShortcut=' + target + ''], app.quit);
            registerAtLogin()
            return true;
        }
        if (cmd === '--squirrel-uninstall') {
            run(['--removeShortcut=' + target + ''], app.quit);
            unregisterAtLogin()
            return true;
        }
        if (cmd === '--squirrel-obsolete') {
            app.quit();
            return true;
        }
    }
    return false;
}

module.exports = { isSquirrel }

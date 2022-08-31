import { createWindowsInstaller } from 'electron-winstaller';

try {
    await createWindowsInstaller({
        appDirectory: 'lb-toolkit-win32-x64',
        outputDirectory: 'installer',
        noMsi: true,
        title: "LB Toolkit 🔧",
        setupExe: "LB Toolkit Setup.exe",
        setupIcon: "assets/favicon.ico",
        iconUrl: "https://www.lorenzobartolini.me/favicon.ico"
    });
    console.log('It worked!');
} catch (e) {
    console.log(`No dice: ${e.message}`);
}

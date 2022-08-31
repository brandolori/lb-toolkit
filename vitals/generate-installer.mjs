import { createWindowsInstaller } from 'electron-winstaller';

try {
    await createWindowsInstaller({
        appDirectory: 'lb-toolkit-win32-x64',
        title: "LB Toolkit",
        outputDirectory: 'installer',
        noMsi: true,
        setupIcon: "assets/favicon.ico",
        iconUrl: "https://www.lorenzobartolini.me/favicon.ico"
    });
    console.log('It worked!');
} catch (e) {
    console.log(`No dice: ${e.message}`);
}

'use strict';

module.exports = async () => {
	const { execa } = await import('execa');
	const cmd = 'netsh';
	const args = ['wlan', 'show', 'interface'];

	const { stdout } = await execa(cmd, args, { encoding: null })
	let ret;

	//@ts-ignore
	ret = /^\s*SSID\s*: (.+)\s*$/gm.exec(stdout);
	ret = ret && ret.length ? ret[1] : null;

	if (!ret) {
		throw new Error('Could not get SSID');
	}

	return ret;
};
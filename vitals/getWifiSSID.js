'use strict';

const { handleCommand } = require('./utils');

module.exports = async () => {
	const cmd = 'netsh';
	const args = ['wlan', 'show', 'interface'];

	const stdout = await handleCommand(cmd, args)
	let ret;

	//@ts-ignore
	ret = /^\s*SSID\s*: (.+)\s*$/gm.exec(stdout);
	ret = ret && ret.length ? ret[1] : null;

	if (!ret) {
		throw new Error('Could not get SSID');
	}

	return ret;
};
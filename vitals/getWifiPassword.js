'use strict';

module.exports = async ssid => {
	const { execa } = await import('execa');
	const cmd = 'netsh';
	const args = ['wlan', 'show', 'profile', `name=${ssid}`, 'key=clear'];

	const { stdout } = await execa(cmd, args)
	let ret;

	ret = /^\s*Contenuto chiave\s*: (.+)\s*$/gm.exec(stdout);
	ret = ret && ret.length ? ret[1] : null;

	if (!ret) {
		throw new Error('Could not get password');
	}

	return ret;
};

'use strict';

const { Iconv } = require('iconv');

module.exports = async () => {
	const { execa } = await import('execa');
	const cmd = 'netsh';
	const args = ['wlan', 'show', 'interface'];

	const { stdout } = await execa(cmd, args, { encoding: null })
	let ret;

	const iconv = new Iconv("CP936", "UTF-8")
	//@ts-ignore
	ret = /^\s*SSID\s*: (.+)\s*$/gm.exec(iconv.convert(stdout.toString()));
	ret = ret && ret.length ? ret[1] : null;

	if (!ret) {
		throw new Error('Could not get SSID');
	}

	return ret;
};
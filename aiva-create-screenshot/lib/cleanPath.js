'use strict';

module.exports = (path, cb)  => {
	if (typeof cb === 'undefined') { cb = () => {}; }

        const $log = require('./log');
	const fs = require('fs');
	const exec = require('child_process').exec;
	const cmd = 'rm -f ' + path + '/*.tpl.html ' + path + '/*.png.*.png';

	$log.info( '# Cleaning path ' + cmd);
	exec(cmd, function(error, stdout, stderr) {
	        if (error) $log.fatal(error);
		if (stdout) $log.info(stdout);
        });
	cb();
};
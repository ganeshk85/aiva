'use strict';

module.exports = {
	info: function (x) {
		console.log(new Date().toISOString(), x);
	},
	fatal: function (x) {
		console.error(new Date().toISOString(), x);
		process.exit(1);
	}
};

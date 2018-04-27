'use strict';

// module to detect what displayes are running
// returns displays in array of strings, like ['1.0', '1.1', '2.4']
// 
// in string '1.3'  1 is number of Xvfb DISPLAY, and 3 is number of buffer
// 
// we assume if firefox is running on that display, we can use that display

const getAvailableDisplays = (processlist, cb) => {
  if (typeof processlist !== 'string') { return []; }

  const arrLines = processlist.split("\n");
  const result = [];
  arrLines.map(line => {
	const indexDisplay = line.indexOf('--display=:');
	if (indexDisplay > -1) {
		const right = line.substring(indexDisplay + '--display=:'.length);
		let i = 0; while (i < right.length && right[i] != ' ') i ++;
		result.push(right.substring(0, i));
	}
  });
  if ( typeof cb === 'function') cb(result);
  return result;  
};

const BUSY_DISPLAYS = {};

const lockDisplay = (display) => {
  BUSY_DISPLAYS[display] = display;
};

const releaseDisplay = (display) => {
  delete BUSY_DISPLAYS[display];
};

module.exports = {
  getAvailableDisplays: getAvailableDisplays,
 
  lock: lockDisplay,
  release: releaseDisplay,
  BUSY_DISPLAYS: BUSY_DISPLAYS
};
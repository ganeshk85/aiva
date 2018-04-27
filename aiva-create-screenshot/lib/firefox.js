'use strict';

const exec = require('./exec');
const run = require('child_process').exec;
const $log = require('./log');
const displays = require('./displays');
const parseDisplays = displays.getAvailableDisplays;

const Firefox = {
    getAllDisplays: (callback) => {
	run( 'ps ax', {}, (err, stdout, stderr) => {
	    parseDisplays(stdout, (data) => { callback(data); });
	});
    },

    getFreeDisplays: (callback) => {
	run( 'ps ax', {}, (err, stdout, stderr) => {
	    parseDisplays(stdout, (data) => { 
		callback(data); 
 	    });
	});
    },

    openConsole: (display, callback) => {
	const vars = process.env;
        vars.DISPLAY = ':' + display;
	run( 'xdotool key Shift+F2 sleep 1', { env: vars }, function(err) {
            if (err) { $log.fatal(err); }
	    if (typeof callback === 'function') callback();
        });
    },

    enterAndCloseConsole: (display, callback) => {
	const vars = process.env;
        vars.DISPLAY = ':' + display;
	run( 'xdotool key Return sleep 0.5 key Shift+F2', { env: vars }, function(err) {
            if (err) { $log.fatal(err); }
	    if (typeof callback === 'function') callback();
        });
    },

    savePageAs: (display, filename, callback) => {
	const vars = process.env;
        vars.DISPLAY = ':' + display;
	run( 'xdotool type --delay 50 "screenshot display-' + display + '.png --fullpage "', { env: vars }, function(err) {
            if (err) { $log.fatal(err); }
	    if (typeof callback === 'function') callback();
        });
    },

    screenshot: (display, filename, callback) => {
	Firefox.openConsole(display, () => {
            Firefox.enterAndCloseConsole(display, () => {
		Firefox.savePageAs(display, filename, callback);
            })
	});
    },

    wait: (callback) => {
        // do not wait so far
        if (typeof callback === 'function') callback();
    },

    start: (display, url, callback) => {
	const vars = process.env;
	vars.DISPLAY = ':' + display;
	const profile = 'aiva' + display.replace( /\./g, '_');
        console.log( 'display=', display, 'profile=', profile, 'url=' + url);
	displays.lock(display);
	const cmd = 'firefox --display=:' + display + ' -P ' + profile + ' ' + url + ' & ';
        console.log( 'cmd: ', cmd );
        run( cmd, {
           env: vars
        }, function(err, stdout, stderr) {
	    if (err) {
		$log.fatal(err);
	    } else if (typeof callback === 'function') {
                setTimeout(callback, 2000);
            }
        });
        // setTimeout(child.unref, 500);
    },

    stop: (display, callback) => {
	const vars = process.env;
        vars.DISPLAY = ':' + display;
	run( 'xdotool key --clearmodifiers ctrl+w', {
	    env: vars
        }, function(err) {
	    displays.release(display);
            if (err) {
		$log.fatal(err);
            }
            if (typeof callback === 'function') callback();
        });
    }
};

module.exports = Firefox; 

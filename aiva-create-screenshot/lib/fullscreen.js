'use strict';

module.exports = function (program, htmlInputPath, pngOutputPath, display, cb) {
    if (typeof cb === 'undefined') { cb = () => {}; }
    const im = require('imagemagick');
    const fs = require('fs');
    const $log = require('./log');
    const execOnDisplay = require('./exec');
    const firefox = require('./firefox');
    const sizeDim = program.size.match(/^(\d+)x(\d+)$/i);
    const windowWidth = 1660;
    
const screenWidth = parseInt(sizeDim[1]);
    const screenHeight = parseInt(sizeDim[2]);
    const pngOutputTempPath = pngOutputPath + '.fullscreen.png';
    const onReady = () => (program.cleanPath) ? require('./cleanPath')(program.cleanPath, cb) : undefined;

    function screenShot(callback) {
        const offsetY = 71;
	const offsetX = 4 + parseInt(( windowWidth - screenWidth ) / 2, 10);
        const dim = screenWidth + 'x' + (screenHeight) + '+' + offsetX + '+' + offsetY;
        console.log('import -window root -crop ' + dim + ' ' + pngOutputTempPath);

        execOnDisplay(display, 'import', ['-window', 'root', '-crop', dim, pngOutputTempPath], {}, function () {
            $log.info('# SCREEN ' + dim + ' path:' + pngOutputTempPath);
            if (typeof callback === 'function') callback(pngOutputTempPath);
        });
    }

    console.log( "fullscreen.htmlInputPath = ", htmlInputPath);
    firefox.wait(() => {
        $log.info('fullscreen.opening new tab in Firefox ' + htmlInputPath);
        firefox.start(display, htmlInputPath, () => {
            $log.info('fullscreen.doing full page screenshot');

	    firefox.screenshot(display, pngOutputTempPath, (file) => {
                $log.info("fullscreen.closing Firefox tab");
                firefox.stop(display, onReady);
            });
        });
    });
};

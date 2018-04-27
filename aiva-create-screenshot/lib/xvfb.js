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
    const pngOutputTempPath = pngOutputPath + '.temp.png';
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

    function resizeTo(input, output, width, callback) {
        // RESIZE TO width
        im.convert([input, '-resize', width, output], function (err, stdout) {
            if (err) { $log.fatal(err); }
            $log.info('# RESIZED ' + output);
            if (typeof callback === 'function') callback();
        });
    }
    console.log( "htmlInputPath = ", htmlInputPath);

    firefox.wait(() => {
        $log.info('Opening new tab in Firefox ' + htmlInputPath);
        firefox.start(display, htmlInputPath, () => {

            $log.info('Doing snapshot');
            screenShot((file) => {

               $log.info("Closing Firefox tab");
               firefox.stop(display, () => {

		    if (program.centered) {
		        $log.info('Centered=' + program.centered);
		        fs.writeFileSync(pngOutputPath, fs.readFileSync(pngOutputTempPath));
		    } else if (program.crop) {
		    } 

                    if (program.resize) {
                        resizeTo(file, pngOutputPath, parseInt(program.resize, 10), onReady);
                    } else {
                    // else file can be renamed - this option is not used though.
                        onReady();
                    }
                });

            });
        });
    });
};

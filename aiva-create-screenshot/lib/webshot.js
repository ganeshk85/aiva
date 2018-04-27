'use strict';

module.exports = function (program, htmlInputPath, pngOutputPath, cb) {
	if (typeof cb === 'undefined') { cb = () => {}; }

	const $log = require('./log');
	const webshot = require('webshot');
	const im = require('imagemagick');
        const onReady = () => (program.cleanPath) ? require('./cleanPath')(program.cleanPath, cb) : undefined;
	
	const isLocalFile = (file) => {
		if (file.substring(0, 1) == '/') return true;
		if (file.substring(0, 'file:///'.length) == 'file:///') return true;
		if (file.substring(1, 3) == ':/') return true; // windows file forma
		if (file.substring(1, 3) == ':\\') return true; // windows file forma
		return false;
	};

	function cropTo(input, output, width, height, offsetX, offsetY, callback) {
		// RESIZE TO width AND CROP TO HEIGHT  // no '-trim'
		im.convert([input, '-resize', width, '-crop', width + 'x' + height + '+' + offsetX + 'x' + offsetY, output], function (err, stdout) {
			if (err) { $log.fatal(err); }
			$log.info("# RESIZED AND CROPPED " + output);
			if (typeof callback === 'function') callback();
		});
	}

	function resizeTo(input, output, width, callback) {
		// RESIZE TO width
		im.convert([input, '-resize', width, output], function (err, stdout) {
			if (err) { $log.fatal(err); }
			$log.info("# RESIZED " + output);
			if (typeof callback === 'function') callback();
		});
	}

	var screenWidth = program.size;
	if (typeof program.size === 'string' && program.size.indexOf('x') !== -1) {
	    var sizeDim = program.size.match(/^(\d+)x(\d+)$/i);
            screenWidth = sizeDim[1];
	}
	if (typeof screenWidth === 'string') {
		screenWidth = parseInt(screenWidth, 10);
	}

	const webshotOptions = {
		screenSize: { width: screenWidth, height: screenWidth },
		shotSize: { width: screenWidth + 10, height: 'all' }
	};
	if (isLocalFile(htmlInputPath)) {
		webshotOptions.siteType = 'file';
	}
	webshot(
		htmlInputPath,
		pngOutputPath + '.' + screenWidth + '.png',
		webshotOptions,
		function (err) {
			if (err) { $log.fatal(err); }

			$log.info('# SCREENSHOT SAVED: ' + pngOutputPath + '.' + screenWidth + '.png');

			if (program.clean) {
				$log.info("# REMOVING ORIGINAL HTML");
				fs.unlink(htmlInputPath);
			}

			$log.info('# PROGRAM: ' + JSON.stringify(program));

			if (typeof program.centered === 'string') {
				const cropDim = program.crop.match(/^(\d+)x(\d+)$/i);
				const croppedWidth  = cropDim[1];
				const croppedHeight = cropDim[2];
				const offsY = 0;
				const offsX = parseInt((screenWidth - croppedWidth) / 2, 10);

				$log.info('# CENTER DIMENSIONS: ' + croppedWidth + 'x' + croppedHeight + '+' + offsX + 'x' + offsY );
				cropTo(pngOutputPath + '.' + screenWidth + '.png', pngOutputPath, croppedWidth, croppedHeight, offsX, offsY, function () {
					if (program.clean) {
						$log.info("# REMOVING ORIGINAL SCREENSHOT");
						fs.unlink(pngOutputPath + '.' + screenWidth + '.png');
					}
					onReady();
				});
                        } else if (typeof program.crop === 'string') {
				const cropDim = program.crop.match(/^(\d+)x(\d+)$/i);
				const croppedWidth  = cropDim[1];
				const croppedHeight = cropDim[2];
				const offsY = 0; const offsX = 0;

				$log.info('# CROPPING DIMENSIONS: ' + croppedWidth + 'x' + croppedHeight + '+' + offsX + 'x' + offsY );
				cropTo(pngOutputPath + '.' + screenWidth + '.png', pngOutputPath, croppedWidth, croppedHeight, offsX, offsY, function () {
					if (program.clean) {
						$log.info("# REMOVING ORIGINAL SCREENSHOT");
						fs.unlink(pngOutputPath + '.' + screenWidth + '.png');
					}
					onReady();
				});

			} else if (typeof program.resize === 'string' || typeof program.resize == 'number') {

				$log.info('# RESIZING : ' + program.resize);
				resizeTo(pngOutputPath + '.' + screenWidth + '.png', pngOutputPath, program.resize, function () {
					if (program.clean) {
						$log.info("# REMOVING ORIGINAL SCREENSHOT");
						fs.unlink(pngOutputPath + '.' + screenWidth + '.png');
					}
					onReady();
				});
			} else {
			 	onReady();
			}
		}
	);
};

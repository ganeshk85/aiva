'use strict';

const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	http = require('http').Server(app),
	fs = require('fs'),
	$log = require('./lib/log'),
        displays = require('./lib/displays'),
	taskqueue = require('./lib/taskqueue');

const server = (serverOptions) => {

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

	// Home page: just show that this server is running
	app.get('/', (req, res) => {
		res.status(200).json({ status: 'server is running' });
	});

	// Status action: to check if there is anything in the current queue
	app.get('/status', (req, res) => {
		res.status(200).json({ BUSY_DISPLAYS: displays.BUSY_DISPLAYS, taskqueue: taskqueue.queue });
	});

	// Action to terminate everything that is queued
	app.get('/stop', (req, res) => {
		 // queue.close(true);
		res.status(200).json(taskqueue.queue.stop());
	});

	// POST action the the home page url should add resiing task into the queue
	// Expected JSON payload with the same parameters as we have in the command line arguments
	app.post('/', (req, res) => {
		const program = Object.assign({}, req.body);
		const encodeUrl = (url) => {
			return 'websites/' + escape(url).replace(/\//g, '__');
		};
		const getOutputFilePath = () => {
			const basename = program.project ? "project-" + program.project : encodeUrl(program.url);
			return program.path + '/' + basename;
		};

		const fatal = (msg) => {
			res.status(500).json({ error: msg });
			console.error(new Date().toISOString(), msg);
		};

		// Folder path must exist
		try {
			if (!fs.statSync(program.path).isDirectory()) {
				return fatal("Provided path is not a valid directory");
			}
		} catch (err) {
			return fatal("Provided path is not a valid directory. " + err.toString());
		}
		const pngOutputPath = (program.output) ? program.output : getOutputFilePath() + ".png";
		var htmlInputPath = program.html ? program.html : program.url;

		if (program.project) {	
			htmlInputPath = getOutputFilePath() + ".html";
			// HTML file must exists
			try {
				if (!fs.statSync(htmlInputPath).isFile()) {
					return fatal("ERROR: Invalid project id or HTML file");
				}
			} catch (err) {
				return fatal("ERROR: Invalid project id or HTML. " + err.toString());
			}
		}

		$log.info('# PATH: ' + program.path);
		if (program.html) {
			$log.info('# HTML: ' + program.html);
		} else if (program.url) {
			$log.info('# URL: ' + program.url);
		} else {
			$log.info('# PROJECT: ' + program.project);
		}
		$log.info('# SIZE: ' + program.size);
		$log.info('# CROP: ' + program.crop);
		$log.info('# CENTERED: ' + program.centered);
		$log.info('# RESIZE: ' + program.resize);

		res.status(200).json( taskqueue.run(program, htmlInputPath, pngOutputPath) );
	});

	const args = process.argv.slice(2);
	const port = (typeof serverOptions.port !== 'undefined') ? serverOptions.port :
		((typeof args[0] !== 'undefined' && parseInt(args[0], 10) > 0) ? parseInt(args[0], 10) : 7001);
	http.listen(port, 'localhost', () => {
		console.log(`listening on *:${port}`);
	});
	return http;

};

if (require.main === module) {
	server({});
} else {
	module.exports = (options) => (server(options));
}



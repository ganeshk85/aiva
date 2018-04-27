'use strict';
const fs = require('fs'), program = require('commander'), $log = require('./lib/log');

program
  .version('1.0.0')
  .usage('--path <path> --project <id> --size 800 --resize 255 --verbose --clean')
  .option('--verbose', 'Verbose output')
  .option('--method [name]', 'if "xvfb" specified, screenshoting using XVfb + Firefox will be done')
  .option('--clean', 'Optional flag- remove input HTML file and intermediary image files after success')
  .option('--cleanPath [path]', 'Optional - path to be cleaned after execution')
  .option('--html [path]', 'Path to the local HTML file')
  .option('--path [path]', 'Path to the /assets/images/projects folder where utility should search for HTML file')
  .option('--project <n>', 'Project ID, defining input HTML file name', parseInt)
  .option('--url [url]', 'Website URL, if project id is not defined')
  .option('--output [path]', 'Optional - implicit path for the destination png')
  .option('--size [dim]', 'Size of the browser for the screenshot')
  .option('--resize [value]', '(optional) Resize to width, keeping the ratio of the image', /^(\d+)$/i)
  .option('--crop [value]', '(optional) Resize to width, then crop image to some dimensions', /^(\d+x\d+)$/i)
  .option('--centered [value]', '(optional) Ñrop the center of the image to some dimensions', /^(\d+x\d+)$/i)
  .parse(process.argv);

if (!program.path || !program.size) {
  $log.fatal("Usage: " + program.usage());
}
if (!program.project && !program.url && !program.html) {
  $log.fatal("Either project ID or website URL or local HTML must be specified " + program.usage() );
}

// Folder path must exist
try {
  if (!fs.statSync(program.path).isDirectory()) {
    $log.fatal("Provided path is not a valid directory");
  }
} catch (err) {
  $log.fatal("Provided path is not a valid directory. " + err.toString());
}

const encodeUrl = (url) => {
  return 'websites/' + escape(url).replace(/\//g, '__');
};

const getOutputFilePath = () => {
  const basename = program.project ? "project-" + program.project : encodeUrl(program.url);
  return program.path + '/' + basename;
};

const pngOutputPath = (program.output) ? program.output : getOutputFilePath() + ".png";
let htmlInputPath = program.url;

if (program.project) {
  htmlInputPath = getOutputFilePath() + ".html";
  // HTML file must exists
  try {
    if (!fs.statSync(htmlInputPath).isFile()) {
      $log.fatal("ERROR: Invalid project id or HTML file");
    }
  } catch (err) {
    $log.fatal("ERROR: Invalid project id or HTML. " + err.toString());
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

if (program.method === 'fullscreen') {
  require('./lib/fullscreen')(program, htmlInputPath, pngOutputPath);  
} else if (program.method === 'xvfb') {
  require('./lib/xvfb')(program, htmlInputPath, pngOutputPath);  
} else {
  require('./lib/webshot')(program, htmlInputPath, pngOutputPath);
}

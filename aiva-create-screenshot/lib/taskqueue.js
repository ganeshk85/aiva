'use strict';

const seqqueue = require('seq-queue');
const $log = require('./log');
const displays = require('./displays');
const firefox = require('./firefox');
const TIMEOUT = 60000;;
const queue = seqqueue.createQueue(TIMEOUT);

const onTimeout = () => {
  console.log('task timeout');
};

// once task is coming,
//    if method is webshot, run it without queue?
//    if method if firefox, get list of active displays. 
//       and detect list of free displays - where nothing is launched
//    if there is no free displays, put the task to the queue


const run = (program, htmlInputPath, pngOutputPath) => {
  if (program.method === 'webshot') {
    console.log('webshot, direct capturing');
    // we do not have queue here all can be done in parallel
    require('./webshot')(program, htmlInputPath, pngOutputPath);
  } else if (program.method === 'xvfb') {
    console.log('xvfb, checking for free displays');
    firefox.getFreeDisplays((listDisplays) => {
      // console.log('displays', listDisplays);
      if (listDisplays.length !== 0) {
	const rand = listDisplays[Math.floor(Math.random() * listDisplays.length)];
        console.log( 'display ', rand, ' was chosen to run on' );
        // take random mapDisplays and start screenshooting
	require('./xvfb')(program, htmlInputPath, pngOutputPath, rand);
      } else {
	console.log('no free displays: xvfb');
      }
    });
  } else if (program.method === 'fullscreen') {
    console.log('fullscreen, checking for free displays');
    firefox.getFreeDisplays((listDisplays) => {
      // console.log('displays', listDisplays);
      if (listDisplays.length !== 0) {
	const rand = listDisplays[Math.floor(Math.random() * listDisplays.length)];
        console.log( 'display ', rand, ' was chosen to run fullscreen on' );
        // take random mapDisplays and start screenshooting
	require('./fullscreen')(program, htmlInputPath, pngOutputPath, rand);
      } else {
	console.log('no free displays: fullscreen');
      }
    });
  }
  return { result: 'enqueued', method: program.method };
};
  
module.exports = {
   run: run,
   queue: queue
};

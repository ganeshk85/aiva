'use strict';

const childproc = require('child_process');
const EventEmitter = require('events').EventEmitter;

module.exports = function (display, file, args, o, callback) {
    const env = Object.create( process.env );
    env.DISPLAY = ':' + display;

    var options = {
        encoding: 'utf8',
        env: env,
        timeout: 0,
        maxBuffer: 500 * 1024,
        killSignal: 'SIGKILL',
        output: null
    };
    if (o) {
      for( var key in o ) { options[key] = o[key]; }
    } 
    if ('function' != typeof callback) callback = null;

    var child = childproc.spawn(file, args, options);
    var killed = false;
    var timedOut = false;

    var Wrapper = function (proc) {
        this.proc = proc;
        this.stderr = new Accumulator();
        proc.emitter = new EventEmitter();
        proc.on = proc.emitter.on.bind(proc.emitter);
        this.out = proc.emitter.emit.bind(proc.emitter, 'data');
        this.err = this.stderr.out.bind(this.stderr);
        this.errCurrent = this.stderr.current.bind(this.stderr);
    };
    Wrapper.prototype.finish = function (err) {
        this.proc.emitter.emit('end', err, this.errCurrent());
    };

    var Accumulator = function (cb) {
        this.stdout = { contents: "" };
        this.stderr = { contents: "" };
        this.callback = cb;

        var limitedWrite = function (stream) {
            return function (chunk) {
                stream.contents += chunk;
                if (!killed && stream.contents.length > options.maxBuffer) {
                    child.kill(options.killSignal);
                    killed = true;
                }
            };
        };
        this.out = limitedWrite(this.stdout);
        this.err = limitedWrite(this.stderr);
    };
    Accumulator.prototype.current = function () { return this.stdout.contents; };
    Accumulator.prototype.errCurrent = function () { return this.stderr.contents; };
    Accumulator.prototype.finish = function (err) { this.callback(err, this.stdout.contents, this.stderr.contents); };

    var std = callback ? new Accumulator(callback) : new Wrapper(child);

    var timeoutId;
    if (options.timeout > 0) {
        timeoutId = setTimeout(function () {
            if (!killed) {
                child.kill(options.killSignal);
                timedOut = true;
                killed = true;
                timeoutId = null;
            }
        }, options.timeout);
    }

    child.stdout.setEncoding(options.encoding);
    child.stderr.setEncoding(options.encoding);

    child.stdout.addListener("data", function (chunk) { std.out(chunk, options.encoding); });
    child.stderr.addListener("data", function (chunk) { std.err(chunk, options.encoding); });

    var version = process.versions.node.split('.');
    child.addListener(version[0] == 0 && version[1] < 7 ? "exit" : "close", function (code, signal) {
        if (timeoutId) clearTimeout(timeoutId);
        if (code === 0 && signal === null) {
            std.finish(null);
        } else {
            var e = new Error("Command " + (timedOut ? "timed out" : "failed") + ": " + std.errCurrent());
            e.timedOut = timedOut;
            e.killed = killed;
            e.code = code;
            e.signal = signal;
            std.finish(e);
        }
    });

    return child;
};

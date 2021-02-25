const streamThrottle = require("stream-throttle");

module.exports = function(rateKbps) {
    const throttleGroup = new streamThrottle.ThrottleGroup({rate: rateKbps*1000});

    return function(req, res, next) {
        if(req.url.search(/\.mp3$/) > 0 || req.url.search(/\.m4a$/) > 0) {
            const realWrite = res.write;
            const realEnd = res.end;
            const throttle = throttleGroup.throttle();

            res.write = function(chunk, encoding) {
                return throttle.write(new Buffer(chunk, encoding));
            };

            res.end = function(chunk, encoding) {
                if(chunk) {
                    return throttle.end(new Buffer(chunk, encoding));
                }
                else {
                    return throttle.end();
                }
            };

            res.flush = function() {
                return throttle.flush();
            };

            res.on("drain", function() {
                throttle.resume();
            });

            throttle.on('data', function(chunk) {
                if(realWrite.call(res, chunk) === false) {
                    throttle.pause();
                }
            });

            throttle.on('end', function() {
                realEnd.call(res);
            });
        }

        next();
    };
};

const Promise = require("bluebird");
const SimpleLastfm = require("simple-lastfm");
const musicServerSettings = require("./music-server-settings.json");
const http = require("http");
const url = require("url");

function MusicServerLastfm() {
    const lastfm = new SimpleLastfm(musicServerSettings.lastfm);

    if(musicServerSettings.lastfm.session_key === null) {
        function callback(result) {
            if(result.success) {
                console.log("got last.fm session key: " + result.session_key);
            }
            else {
                console.error("could not get last.fm session key");
            }
        }

        result.getSessionKey(callback);
    }

    this.doScrobbleAsync = function(options) {
        return new Promise(function(resolve, reject) {
            options.callback = function(result) {
                if(result.success) {
                    console.log("scrobble success!");
                    resolve(result);
                }
                else {
                    console.log("scrobble failed.");
                    reject(result.error);
                }
            };

            console.log("scrobbling", options);
            lastfm.doScrobble(options);
        });
    };

    this.getAlbumInfoAsync = function(options) {
        return new Promise(function(resolve, reject) {
            console.log("getting album info", options);

            function callback(res) {
                let body = '';
                res.on('data', function(chunk) {
                    body += chunk;
                });
                res.on('end', function() {
                    resolve(JSON.parse(body));
                });
            }

            const path = url.format({
                pathname: "/2.0/",
                query: {
                    method: "album.getInfo",
                    artist: options.artist,
                    album: options.album,
                    format: "json",
                    api_key: musicServerSettings.lastfm.api_key
                }
            });

            http.get({
                host: 'ws.audioscrobbler.com',
                port: 80,
                path: path
            }, callback);
        });
    };

    return this;
}

module.exports = {
    MusicServerLastfm: MusicServerLastfm
};

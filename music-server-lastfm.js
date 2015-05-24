var Promise = require("bluebird");
var SimpleLastfm = require("simple-lastfm");
var musicServerSettings = require("./music-server-settings.json");
var http = require("http");
var url = require("url");

var MusicServerLastfm = function()
{
    var lastfm = new SimpleLastfm(musicServerSettings.lastfm);

    if(musicServerSettings.lastfm.session_key === null)
    {
        var callback = function(result)
        {
            if(result.success)
            {
                console.log("got last.fm session key: " + result.session_key);
            }
            else
            {
                console.error("could not get last.fm session key");
            }
        };

        result.getSessionKey(callback);
    }

    this.doScrobbleAsync = function(options)
    {
        return new Promise(function(resolve, reject)
        {
            options.callback = function(result)
            {
                if(result.success)
                {
                    console.log("scrobble success!");
                    resolve(result);
                }
                else
                {
                    console.log("scrobble failed.");
                    reject(result.error);
                }
            };

            console.log("scrobbling", options);
            lastfm.doScrobble(options);
        });
    };

    this.getAlbumInfoAsync = function(options)
    {
        return new Promise(function(resolve, reject)
        {
            console.log("getting album info", options);

            var callback = function(res) {
                var body = '';
                res.on('data', function(chunk)
                {
                    body += chunk;
                });
                res.on('end', function()
                {
                    resolve(JSON.parse(body));
                });
            };

            var path = url.format({
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
};

module.exports = {
    MusicServerLastfm: MusicServerLastfm
};

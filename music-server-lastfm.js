var Promise = require("bluebird");
var SimpleLastfm = require("simple-lastfm");
var musicServerSettings = require("./music-server-settings.json");

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

    return this;
};

module.exports = {
    MusicServerLastfm: MusicServerLastfm
};

var Promise = require("bluebird");
var walk = require("walk");
var path = require("path");
var fs = require("fs");
var http = require("http");

var musicServerSettings = require("./music-server-settings.json");
var lastfm = require("./music-server-lastfm").MusicServerLastfm();
var albums = require("./albums.json");
var musicServerUtil = require("./music-server-util");

function saveAlbumArt(album, response, contentType)
{
    var filename = musicServerUtil.escapeForFileSystem(album.album);
    if(contentType === "image/png")
    {
        filename += ".png";
    }
    else if(contentType === "image/jpeg")
    {
        filename += ".jpg";
    }

    var expectedPath = path.join(
        musicServerSettings.files.base_stream_path,
        musicServerUtil.escapeForFileSystem(album.artist),
        musicServerUtil.escapeForFileSystem(album.album),
        filename);

    console.log(expectedPath);

    var outStream = fs.createWriteStream(expectedPath);
    response.pipe(outStream);

    response.on("error", function(error)
    {
        console.error(error);
    });
}

function retrieveAlbumArt(album)
{
    lastfm.getAlbumInfoAsync(album).then(function(info)
    {
        var imagePathArray = info.album.image;
        var biggestImage = imagePathArray[imagePathArray.length - 1]["#text"];

        var handleResponse = function(response)
        {
            saveAlbumArt(album, response, response.headers["content-type"]);
        };

        http.get(biggestImage, handleResponse).on("error", function(error)
        {
            console.error(error);
        });
    }).catch(function(error)
    {
        console.error(error);
    });
}

for(var i = 0; i < albums.length; i++)
{
    setTimeout(retrieveAlbumArt, i * 4000, albums[i]);
}

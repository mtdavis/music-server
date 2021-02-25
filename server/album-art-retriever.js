const path = require("path");
const fs = require("fs");
const http = require("http");

const musicServerSettings = require("../music-server-settings.json");
const lastfm = require("./music-server-lastfm").MusicServerLastfm();
const albums = require("./albums.json");
const musicServerUtil = require("./music-server-util");

function saveAlbumArt(album, response, contentType) {
    let filename = musicServerUtil.escapeForFileSystem(album.album);
    if(contentType === "image/png") {
        filename += ".png";
    }
    else if(contentType === "image/jpeg") {
        filename += ".jpg";
    }

    const expectedPath = path.join(
        musicServerSettings.files.base_stream_path,
        musicServerUtil.escapeForFileSystem(album.artist),
        musicServerUtil.escapeForFileSystem(album.album),
        filename);

    console.log(expectedPath);

    const outStream = fs.createWriteStream(expectedPath);
    response.pipe(outStream);

    response.on("error", function(error) {
        console.error(error);
    });
}

function retrieveAlbumArt(album) {
    lastfm.getAlbumInfoAsync(album).then(function(info) {
        const imagePathArray = info.album.image;
        const biggestImage = imagePathArray[imagePathArray.length - 1]["#text"];

        function handleResponse(response) {
            saveAlbumArt(album, response, response.headers["content-type"]);
        }

        http.get(biggestImage, handleResponse).on("error", function(error) {
            console.error(error);
        });
    }).catch(function(error) {
        console.error(error);
    });
}

for(let i = 0; i < albums.length; i++) {
    setTimeout(retrieveAlbumArt, i * 4000, albums[i]);
}

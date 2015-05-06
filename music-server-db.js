var Promise = require("bluebird");
var sqlite3 = Promise.promisifyAll(require("sqlite3"));
var musicServerSettings = require("./music-server-settings.json");

var MusicServerDb = function()
{
    var db = new sqlite3.Database(musicServerSettings.files.db_path);

    db.selectTrackByIdAsync = function(trackId)
    {
        var statement = db.prepare(
            "SELECT * FROM track WHERE rowid = $trackId");

        return statement.getAsync({
            $trackId: trackId
        });
    };

    //TODO: when refactoring is complete, should return this rather than db.
    return db;
};

module.exports = {
    MusicServerDb: MusicServerDb
}

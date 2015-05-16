var Promise = require("bluebird");
var walk = require("walk");
var path = require("path");

var db = require("./music-server-db").MusicServerDb();
var musicServerSettings = require("./music-server-settings.json");
var util = require("./music-server-util");

var ignore = (
"ACDC|Acid Mothers Temple|Aerosmith|Air|Air France|albums.txt|analyze.py|analyze2.py|Arctic Monkeys|artists.txt|Atoms Fo" +
"r Peace|Austin Wintory|Baby Grandmothers|Bachman-Turner Overdrive|Bad Company|Beastie Boys|Beck|Big Bad Voodoo Daddy|Bla" +
"ck Sabbath|Black Star|Blind Faith|Blue Öyster Cult|Boards of Canada|Bob Dylan|Bonobo|Booker T & The MGs|Boston|Bruce Spr" +
"ingsteen|Buffy the Vampire Slayer|Cake|Cannibal The Musical|Charlie Daniels Band|Chicago|Clutch|Colours Run|Counting Cro" +
"ws|Cream|Creedence Clearwater Revival|Curtis Mayfield|Daft Punk|Darren Korb|David Bowie|David Holmes|Death|Deep Purple|D" +
"el tha Funkee Homosapien|Deltron 3030|Derek and the Dominos|Dio|Dire Straits|DJ Food|DJ Shadow|Dragonforce|Ducktails|Dun" +
"gen|duplicates.py|Eagles|Eagles of Death Metal|Edgar Winter Group|Edgewater|Electric Six|Emancipator|Ennio Morricone|Eri" +
"c Clapton|Everything Else|Files|Flight of the Conchords|Foghat|Foo Fighters|Fort Knox Five|Fountains of Wayne|Foxygen|Fr" +
"anz Ferdinand|Funkadelic|George Thorogood & the Destroyers|Gnarls Barkley|good.xml|Gorillaz|Gov\'t Mule|Guns \'n Roses|G" +
"ustav Holst|Hans Zimmer|Hieroglyphics|Howard Shore|Incredibad|Incredible Bongo Band|Incubus|J.Geils Band|Jack White|Jaso" +
"n Forrest|Jeff Beck|Jefferson Airplane|Jet|Jethro Tull|Jimi Hendrix|Joe Satriani|John Mayall & the Bluesbreakers|Jonny G" +
"reenwood|Juno Reactor|Jurassic 5|Justice|Kansas|Katamari Damacy|King Crimson|Kow Otani|Kutiman|Led Zeppelin|Lemon Jelly|" +
"lib.xml|Link Wray|Little Feat|Little People|Lynyrd Skynyrd|MC5|Melody\'s Echo Chamber|Metaform|Michael Giacchino|Michael" +
" Jackson|Mountain|New|Nirvana|Nujabes|Oasis|OutKast|output.png|Paul Simon|Pavement|Pearl Jam|Pink Floyd|Polaris|Pond|Por" +
"tugal. The Man|Primus|Queen|Queens of the Stone Age|Radiohead|Red Hot Chili Peppers|REM|RJD2|Robert Randolph " +
"& the Family Band|Rolling Stones|Röyksopp|Saul Williams|Semisonic|Shad|Sigur Rós|Smash Mouth|Soulive|Soundgarden|Spinal " +
"Tap|Spiritualized|Squeeze|Steve Miller Band|Steven Price|Stone Gods|T. Rex|Tame Impala|Temples|Tenacious D|The Allman Br" +
"others Band|The Answer|The Avalanches|The Bakerton Group|The Beatles|The Beta Band|The Black Keys|The Blues Brothers|The" +
" Clash|The Cult|The Dandy Warhols|The Darkness|The Decemberists|The Doobie Brothers|The Killers|The Kinks|The Mooney Suz" +
"uki|The Paul Butterfield Blues Band|The Potatoes|The Raconteurs|The Roots|The Seatbelts|The Small Faces|The Strokes|The " +
"Velvet Underground|The Verve|The White Stripes|The Who|Them Crooked Vultures|Thom Yorke|Three Dog Night|Tom Petty & the " +
"Heartbreakers|Tomoyasu Hotei|tracks.txt|Tycho|U.N.K.L.E|Van Halen|Velvet Revolver|Warren Zevon|White Denim|Wolfmother|Wu" +
"-Tang Clan|Zero 7|ZZ Top").split("|");

var checkForChangedMetadata = function(root, fileStats, next)
{
    var absolutePath = path.join(root, fileStats.name);
    var extension = path.extname(fileStats.name);
    var pathRelativeToMusicRoot = path.relative(
        musicServerSettings.files.base_stream_path, absolutePath).replace(/\\/g, "/");

    var maybeUpdateTrackFromMetadataAsync = function(fileMetadata, dbTrack)
    {
        var metadataTitle = fileMetadata.title;
        var metadataArtist = fileMetadata.artist[0];
        var metadataAlbumArtist = fileMetadata.albumartist[0];
        var metadataAlbum = fileMetadata.album;
        var metadataYear = fileMetadata.year ? Number(fileMetadata.year) : null;
        var metadataTrackNumber = fileMetadata.track.no ? fileMetadata.track.no : null;
        var metadataGenre = fileMetadata.genre[0];
        var metadataDuration = fileMetadata.duration;

        if(metadataTitle !== dbTrack.title ||
            metadataArtist !== dbTrack.artist ||
            metadataAlbumArtist !== dbTrack.album_artist ||
            metadataAlbum !== dbTrack.album ||
            metadataYear !== dbTrack.year ||
            metadataTrackNumber !== dbTrack.track_number ||
            metadataGenre !== dbTrack.genre ||
            Math.abs(metadataDuration - dbTrack.duration) > 1)
        {
            console.log(fileMetadata, dbTrack);
            dbTrack.title = metadataTitle;
            dbTrack.artist = metadataArtist;
            dbTrack.album_artist = metadataAlbumArtist;
            dbTrack.album = metadataAlbum;
            dbTrack.year = metadataYear;
            dbTrack.track_number = metadataTrackNumber;
            dbTrack.genre = metadataGenre;
            dbTrack.duration = metadataDuration;

            return db.updateTrackFromMetadataAsync(dbTrack);
        }
        else
        {
            return util.dummyPromise();
        }
    }

    if(extension === ".mp3")
    {
        process.stdout.write(".");

        Promise.join(
            util.getMetadataAsync(absolutePath, {duration: true}),
            db.selectTrackByPathAsync(pathRelativeToMusicRoot)
        ).spread(function(fileMetadata, dbTrack)
        {
            if(fileMetadata && dbTrack)
            {
                return maybeUpdateTrackFromMetadataAsync(fileMetadata, dbTrack);
            }
            else
            {
                return util.dummyPromise()
            }
        }).then(next);
    }
    else
    {
        next();
    }
}

var checkForNewFile = function(root, fileStats, next)
{
    var absolutePath = path.join(root, fileStats.name);
    var extension = path.extname(fileStats.name);
    var pathRelativeToMusicRoot = path.relative(
        musicServerSettings.files.base_stream_path, absolutePath).replace(/\\/g, "/");

    var addTrackFromMetadataAsync = function(fileMetadata)
    {
        var metadataTitle = fileMetadata.title;
        var metadataArtist = fileMetadata.artist[0];
        var metadataAlbumArtist = fileMetadata.albumartist[0];
        var metadataAlbum = fileMetadata.album;
        var metadataYear = fileMetadata.year ? Number(fileMetadata.year) : null;
        var metadataTrackNumber = fileMetadata.track.no ? fileMetadata.track.no : null;
        var metadataGenre = fileMetadata.genre[0];
        var metadataDuration = fileMetadata.duration;

        var dbTrack = {};
        dbTrack.title = metadataTitle;
        dbTrack.artist = metadataArtist;
        dbTrack.album_artist = metadataAlbumArtist;
        dbTrack.album = metadataAlbum;
        dbTrack.year = metadataYear;
        dbTrack.track_number = metadataTrackNumber;
        dbTrack.genre = metadataGenre;
        dbTrack.duration = metadataDuration;
        dbTrack.path = pathRelativeToMusicRoot;

        return db.addTrackFromMetadataAsync(dbTrack);
    }

    if(extension === ".mp3")
    {
        process.stdout.write(".");

        db.selectTrackByPathAsync(pathRelativeToMusicRoot).then(function(dbTrack)
        {
            if(dbTrack)
            {
                next();
            }
            else
            {
                util.getMetadataAsync(absolutePath, {duration: true}).
                    then(addTrackFromMetadataAsync).
                    then(next);
            }
        });
    }
    else
    {
        next();
    }
}

var checkForMovedFile = function(root, fileStats, next)
{
    var absolutePath = path.join(root, fileStats.name);
    var extension = path.extname(fileStats.name);
    var pathRelativeToMusicRoot = path.relative(
        musicServerSettings.files.base_stream_path, absolutePath).replace(/\\/g, "/");

    var maybeUpdatePathAsync = function(dbTrack)
    {
        if(dbTrack && dbTrack.path !== pathRelativeToMusicRoot)
        {
            console.log(dbTrack);

            return db.updateTrackPathAsync(dbTrack.id, pathRelativeToMusicRoot);
        }
        else
        {
            return util.dummyPromise();
        }
    }

    if(extension === ".mp3")
    {
        process.stdout.write(".");

        util.getMetadataAsync(absolutePath).then(function(fileMetadata)
        {
            return db.selectTrackByInfoAsync({
                title: fileMetadata.title,
                artist: fileMetadata.artist[0],
                album: fileMetadata.album,
                track_number: fileMetadata.track.no ? fileMetadata.track.no : null,
                year: fileMetadata.year ? Number(fileMetadata.year) : null
            });
        }).then(maybeUpdatePathAsync).then(next);
    }
    else
    {
        next();
    }
}

var scanAsync = function(fileHandler)
{
    return new Promise(function(resolve, reject)
    {
        walker = walk.walk(musicServerSettings.files.base_stream_path, {
            filters: ["New"]
            //filters: ignore
        });

        walker.on("file", fileHandler);
        walker.on("end", resolve);
    });
}

var scanForChangedMetadataAsync = function()
{
    return scanAsync(checkForChangedMetadata);
}

var scanForNewFilesAsync = function()
{
    return scanAsync(checkForNewFile);
}

var scanForMovedFilesAsync = function()
{
    return scanAsync(checkForMovedFile);
}

module.exports = {
    scanForChangedMetadataAsync: scanForChangedMetadataAsync,
    scanForNewFilesAsync: scanForNewFilesAsync,
    scanForMovedFilesAsync: scanForMovedFilesAsync
};

scanForMovedFilesAsync().then(scanForNewFilesAsync).then(scanForChangedMetadataAsync).then(function()
{
    console.log("done!");
})

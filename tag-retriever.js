const lastfm = require("./music-server-lastfm").MusicServerLastfm();

const MusicServerDb = require("./music-server-db").MusicServerDb;
const db = new MusicServerDb();

async function getTags(track) {
    const tags = await lastfm.getTopTagsAsync(track.artist, track.title);
    // console.log(tags);
    for(let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        await db.saveTag(track.id, tag.name, tag.count);
    }
}

async function main() {
    const tracks = await db.db.allAsync('SELECT id, title, artist FROM track_view WHERE id > 8227');
    for(let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        setTimeout(() => getTags(track), i * 2000);
    }
    console.log('done queueing tracks');
}

main();

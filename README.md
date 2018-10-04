# music-server
Music server + client.

Written with Node.js on the backend, and React and [Material-UI](http://www.material-ui.com/) on the frontend.

[Demo instance available here](https://music-server.mtdavis.org/) (with public-domain music and a few features disabled).

![Screenshot](/screenshot.jpg?raw=true "Screenshot")

Features:
- Stores ID3v2 metadata and play counts in a SQLite DB.
- Search tracks or albums by query (e.g., `play_count > 5 && genre == 'Psychedelic Rock'`)
- Scrobbles plays to [last.fm](https://last.fm).
- Loads lyrics for current track from [genius.com](https://genius.com/).
- Supports scanning the file system for new files, moved files, and changes to metadata.

# music-server
Music server + client.
Written with node.js on the backend, React and [Material-UI](http://www.material-ui.com/) on the frontend.

![Screenshot](/screenshot.jpg?raw=true "Screenshot")

Features:
- Stores ID3v2 metadata and play counts in a SQLite DB.
- Search tracks or albums by query (e.g., `play_count > 5 && genre == 'Psychedelic Rock'`)
- Scrobbles plays to [last.fm](//last.fm).
- Loads lyrics for current track from [genius.com](//genius.com).
- Supports scanning the file system for new files, moved files, and changes to metadata.

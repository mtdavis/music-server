from typing import Optional

def md5(text: str) -> str: ...

class LastFMNetwork:
    def __init__(
        self,
        api_key: str = "",
        api_secret: str = "",
        session_key: str = "",
        username: str = "",
        password_hash: str = "",
        token: str = "",
    ): ...

    def update_now_playing(
        self,
        artist: str,
        title: str,
        album: Optional[str] = None,
        album_artist: Optional[str] = None,
        duration: Optional[str] = None,
        track_number: Optional[str] = None,
        mbid: Optional[str] = None,
        context: Optional[str] = None,
    ): ...

    def scrobble(
        self,
        artist: str,
        title: str,
        timestamp: int,
        album: Optional[str] = None,
        album_artist: Optional[str] = None,
        track_number: Optional[int] = None,
        duration: Optional[int] = None,
        stream_id: Optional[int] = None,
        context: Optional[str] = None,
        mbid: Optional[int] = None,
    ): ...

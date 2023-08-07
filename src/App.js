import { useEffect, useState } from "react";
import React from 'react';
import axios from 'axios';
import { FaSpotify } from 'react-icons/fa';
import './App.css';

function App() {
  const CLIENT_ID = "0d63b35e77424ff6ae152308ed555b45";
  const REDIRECT_URI = "http://localhost:3000";
  // const REDIRECT_URI = "https://spotifyground.netlify.app/";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPES = "playlist-modify-public playlist-modify-private user-library-modify";

  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([]);
  const [playlistMessage, setPlaylistMessage] = useState("");
  const [favoritesMessage, setFavoritesMessage] = useState("");

  const [playlistName, setPlaylistName] = useState("");
  const [playlistSuccessMessage, setPlaylistSuccessMessage] = useState("");

  const createPlaylist = async () => {
    try {

      const userId = '	314f6zc5nth26izucjrouvbdrww4'; // Replace with the user's Spotify ID.

      const response = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        name: playlistName,
        public: true, // Set to true if you want the playlist to be public.
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Playlist created:', response.data);
      setPlaylistSuccessMessage("Playlist created successfully!");
    } catch (error) {
      console.error('Error creating playlist:', error);
      setPlaylistSuccessMessage("Error creating playlist.");
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token);
  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  const searchArtists = async (e) => {
    e.preventDefault();

    console.log("Token used for request: ", token);

    try {
      const { data } = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: searchKey,
          type: "artist",
        },
      });

      setArtists(data.artists.items);
    } catch (error) {
      console.error("API request error: ", error);
    }
  };

  const formatFollowersCount = (count) => {
    if (count >= 1000000000) {
      return (count / 1000000000).toFixed(1) + "B";
    } else if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else {
      return count.toString();
    }
  };

  const renderArtists = () => {
    if (artists.length === 0) {
      return (
        <div className="centered">
          <p>No artist found on Spotify.</p>
          <p> Please try another search term.</p>
        </div>
      );
    }

    return artists.slice(0, 6).map((artist) => (
      <div key={artist.id} className="artist">
        {artist.images.length ? (
          <img width={"10%"} src={artist.images[0].url} alt="" />
        ) : (
          <div className="no-image">No Image</div>
        )}
        <div className="artist-info">
          <p className="artist-name">Name: {artist.name}</p>
          <p>Followers: {formatFollowersCount(artist.followers.total)}</p>
          <p>Popularity: {artist.popularity}</p>
          <p>Genres: {artist.genres.join(", ")}</p>
          <button onClick={() => getTopTracks(artist.id)}>Show Top Tracks</button>
        </div>
      </div>
    ));
  };


  // TRACKS

  const [topTracks, setTopTracks] = useState([]);

  const getTopTracks = async (artistId) => {
    try {
      const { data } = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          country: "US",
        },
      });

      setTopTracks(data.tracks);
    } catch (error) {
      console.error("API request error: ", error);
    }
  };

  const addToPlaylist = async (trackUri) => {
    try {
      // Replace 'YOUR_ACCESS_TOKEN' with the actual access token obtained from Spotify authentication.
      const accessToken = token;

      // Replace 'YOUR_SPOTIFY_USER_ID' with the user's Spotify ID.
      const userId = '314f6zc5nth26izucjrouvbdrww4';

      // Replace 'YOUR_PLAYLIST_ID' with the ID of the playlist where you want to add the track.
      const playlistId = '6pkD96B6qzLBRGbKAhF9mb';

      // Make a POST request to add the track to the playlist.
      const response = await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        uris: [trackUri],
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Track added to playlist:', response.data);
      setPlaylistMessage("Track added to playlist successfully!");
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      setPlaylistMessage("Error adding track to playlist.");
    }
  };

  const addToFavorites = async (trackId) => {
    try {
      // Replace 'YOUR_ACCESS_TOKEN' with the actual access token obtained from Spotify authentication.
      const accessToken = token;

      // Make a PUT request to add the track to the user's saved tracks (favorites).
      const response = await axios.put(`https://api.spotify.com/v1/me/tracks`, {
        ids: [trackId],
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Track added to favorites:', response.data);
      setFavoritesMessage("Track added to favorites successfully!");
    } catch (error) {
      console.error('Error adding track to favorites:', error);
      setFavoritesMessage("Error adding track to favorites.");
    }
  };


  const renderTopTracks = () => {
    return topTracks.map((track) => (
      <div key={track.id} className="track">
        <img width={"10%"} src={track.album.images[0].url} alt="" />
        <div className="track-info">
          <p className="track-name">Name: {track.name}</p>
          <p>Album: {track.album.name}</p>
          <p>Duration: {formatDuration(track.duration_ms)}</p>
          <button onClick={() => addToPlaylist(track.uri)}>Add to Playlist</button>
          <button onClick={() => addToFavorites(track.id)}>Add to Favorites</button> {/* New button */}
        </div>
      </div>
    ));
  };

  const formatDuration = (duration_ms) => {
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = ((duration_ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify React</h1>
        {!token ?
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`}>
            <div className="spotify-icon">
              <FaSpotify className="spotify-icon__logo" />
              <span className="spotify-icon__text">Login to Spotify</span>
            </div>
          </a>
          : <button onClick={logout}>Logout</button>}

        {token ? (
          <React.Fragment>
            {/* Existing artist and top tracks sections... */}

            {/* Create New Playlist */}
            <div className="playlist-container">
              <h3>Create New Playlist ---| OR |--- Search an Artist</h3>
              <form onSubmit={(e) => { e.preventDefault(); createPlaylist(); }}>
                <input
                  type="text"
                  placeholder="Playlist Name"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                />
                <button type="submit">Create Playlist</button>
              </form>
              <p>{playlistSuccessMessage && <p>{playlistSuccessMessage}</p>}</p>
            </div>

            {/* Existing playlistMessage and favoritesMessage sections... */}
          </React.Fragment>
        ) : null}

        {token ?
          <form className="search" onSubmit={searchArtists}>
            <input type="text" placeholder="Search Artist ..." onChange={e => setSearchKey(e.target.value)} />
            <button type="submit">Search</button>
          </form>
          : <h2 className="loginh2">Please login</h2>
        }


        {token ? (
          <React.Fragment>
            <div className="artist-container">
              {renderArtists()}
            </div>

            <div>
              {/* Display top tracks */}
              <div className="top-tracks">
                <h2>Top Tracks</h2>
                <div className="track-container">{renderTopTracks()}</div> {/* Wrap with the track-container */}
                <p>{playlistMessage && <p>{playlistMessage}</p>}</p>
                <p>{favoritesMessage && <p>{favoritesMessage}</p>}</p>
              </div>
            </div>

          </React.Fragment>
        ) : null}


      </header>
    </div>
  );
}

export default App;
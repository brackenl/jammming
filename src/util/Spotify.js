import SearchBar from "../Components/SearchBar/SearchBar";

let accessToken;
const clientId = 'XXXX'; // need to add client ID from API dashboard for this to work
const redirectUri = 'https://brackenl-jammming.surge.sh';

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        // check for access token match
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            // Clear parameters and get new access token if expired
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const accessUri = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessUri;
        }
    },

    search(term) {
        const accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {Authorization: `Bearer ${accessToken}`}
          })
          .then(response => {
            return response.json()})
            .then(jsonresponse => {
                if (!jsonresponse.tracks) {
                    return [];
                } else {
                    return jsonresponse.tracks.items.map(track => ({
                        id: track.id,
                        name: track.name,
                        artist: track.artists[0].name,
                        album: track.album.name,
                        uri: track.uri
                    }))
                }
            });
    },

    savePlaylist(playlistName, trackUris) {
        if (!playlistName || !trackUris.length) {
            return ;
        }
        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };
        let userId;

        return fetch('https://api.spotify.com/v1/me', { headers: headers })
            .then(response => {return response.json()})
            .then(jsonresponse => {
                userId = jsonresponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, { headers: headers, method: 'POST', body: JSON.stringify({ name : playlistName })})
            })
            .then(response => {return response.json()})
            .then(jsonResponse => {
                const playlistId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, { headers: headers, method: 'POST', body: JSON.stringify({uris: trackUris})}) /* look at step 94 */
            })
    }
};

export default Spotify;

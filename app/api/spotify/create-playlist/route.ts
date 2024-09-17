import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { accessToken, playlistName, tracks } = await request.json();

  if (!accessToken || !playlistName || !tracks) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    // Get the user's Spotify ID
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const userData = await userResponse.json();

    // Create a new playlist
    const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: playlistName,
        public: false,
        description: 'Created by AI Playlist Generator',
      }),
    });
    const playlistData = await createPlaylistResponse.json();

    // Add tracks to the playlist
    const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: tracks,
      }),
    });

    if (!addTracksResponse.ok) {
      throw new Error('Failed to add tracks to playlist');
    }

    return NextResponse.json({ success: true, playlistId: playlistData.id });
  } catch (error) {
    console.error('Error creating Spotify playlist:', error);
    return NextResponse.json({ error: 'Failed to create Spotify playlist' }, { status: 500 });
  }
}
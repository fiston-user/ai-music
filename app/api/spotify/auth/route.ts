import { NextResponse } from 'next/server';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';

export async function GET() {
  const scopes = ['playlist-modify-private', 'playlist-modify-public'];
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    scope: scopes.join(' '),
  });

  return NextResponse.redirect(`${SPOTIFY_AUTH_URL}?${params.toString()}`);
}
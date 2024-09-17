import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/error?message=No code provided', request.url));
  }

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();

    // Redirect to the SpotifyCallback component with the token data
    const callbackUrl = new URL('/spotify/callback', request.url);
    callbackUrl.search = new URLSearchParams(tokenData).toString();
    return NextResponse.redirect(callbackUrl);
  } catch (error) {
    console.error('Error in Spotify callback:', error);
    return NextResponse.redirect(new URL('/error?message=Authentication failed', request.url));
  }
}
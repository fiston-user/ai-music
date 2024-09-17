"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SpotifyCallback() {
  const [status, setStatus] = useState("Processing...");
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");
    const expiresIn = urlParams.get("expires_in");

    if (accessToken && refreshToken && expiresIn) {
      localStorage.setItem("spotifyAccessToken", accessToken);
      localStorage.setItem("spotifyRefreshToken", refreshToken);
      localStorage.setItem(
        "spotifyTokenExpiry",
        (Date.now() + parseInt(expiresIn) * 1000).toString()
      );
      setStatus("Authentication successful! Redirecting...");
      setTimeout(() => router.push("/"), 2000);
    } else {
      setStatus("Authentication failed. Please try again.");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a1a0a] text-green-300">
      <p className="text-xl">{status}</p>
    </div>
  );
}

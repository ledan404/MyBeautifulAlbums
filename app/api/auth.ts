import { jwtDecode } from "jwt-decode";

const IS_LOCAL = process.env.IS_LOCAL === "true";

const BASE_URL = "https://mybeautifulalbums.onrender.com";
const LOGIN_URL =
  "https://accounts.spotify.com/authorize?response_type=code&client_id=9d5a71e1bdd543618b045210f884cef8&redirect_uri=https://mybeautifulalbums.vercel.app/callback&scope=user-library-read user-read-private user-read-email";

interface TokenData {
  jwt_access_token: string;
  jwt_refresh_token: string;
  spotify_access_token: string;
  spotify_refresh_token: string;
  spotify_expires_in: number;
  spotify_token_expiry?: number;
}

async function getToken(code: string): Promise<TokenData> {
  const url = `${BASE_URL}/spotify/callback/?code=${encodeURIComponent(code)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errorData = await res.json();

    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }

  const data: TokenData = await res.json();

  // Calculate and store the expiry time
  const now = Date.now();
  const expiresIn = data.spotify_expires_in * 1000; // convert to milliseconds

  data.spotify_token_expiry = now + expiresIn;

  localStorage.setItem("tokenData", JSON.stringify(data));

  return data;
}

async function refreshJwtToken(): Promise<TokenData> {
  const url = `${BASE_URL}/refresh/`;
  const tokenData = JSON.parse(localStorage.getItem("tokenData") || "{}");

  console.log("Attempting to refresh JWT token with:", {
    jwt_refresh_token: tokenData.jwt_refresh_token ? "exists" : "missing",
  });

  if (!tokenData.jwt_refresh_token) {
    console.error("No JWT refresh token available");
    throw new Error("No JWT refresh token available");
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: tokenData.jwt_refresh_token,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();

      console.error("JWT token refresh failed:", errorData);
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    console.log("JWT token refresh successful:", data);

    // Update only JWT tokens in localStorage
    const updatedTokenData = {
      ...tokenData,
      jwt_access_token: data.access,
    };

    localStorage.setItem("tokenData", JSON.stringify(updatedTokenData));

    return updatedTokenData;
  } catch (error) {
    console.error("Error during JWT token refresh:", error);
    throw error;
  }
}

async function refreshSpotifyToken(): Promise<TokenData> {
  const url = `${BASE_URL}/spotify/refresh-token/`;
  const tokenData = JSON.parse(localStorage.getItem("tokenData") || "{}");

  console.log("Attempting to refresh Spotify token with:", tokenData);

  if (!tokenData.spotify_refresh_token) {
    console.error("No Spotify refresh token available");
    throw new Error("No Spotify refresh token available");
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.jwt_access_token}`,
      },
      body: JSON.stringify({
        refresh_token: tokenData.spotify_refresh_token,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();

      console.error("Spotify token refresh failed:", errorData);
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    console.log("Spotify token refresh successful:", data);

    // Update Spotify tokens in localStorage
    const updatedTokenData = {
      ...tokenData,
      spotify_access_token: data.spotify_access_token,
      spotify_refresh_token: data.spotify_refresh_token,
      spotify_expires_in: data.spotify_expires_in,
      spotify_token_expiry: Date.now() + data.spotify_expires_in * 1000,
    };

    localStorage.setItem("tokenData", JSON.stringify(updatedTokenData));

    return updatedTokenData;
  } catch (error) {
    console.error("Error during Spotify token refresh:", error);
    throw error;
  }
}

function getJwtToken(): { access_token: string; refresh_token: string } | null {
  const tokenData = JSON.parse(localStorage.getItem("tokenData") || "{}");

  return (
    {
      access_token: tokenData.jwt_access_token,
      refresh_token: tokenData.jwt_refresh_token,
    } || null
  );
}

function getSpotifyToken(): string | null {
  const tokenData = JSON.parse(localStorage.getItem("tokenData") || "{}");

  return tokenData.spotify_access_token || null;
}

function isTokenExpired(): boolean {
  const token = getJwtToken();

  if (!token) return true;
  const decodedToken = jwtDecode(token.access_token) as { exp?: number };

  return decodedToken.exp ? decodedToken.exp * 1000 < Date.now() : true;
}

async function fetchWithToken(
  spotify: boolean,
  url: string,
  options: RequestInit = {},
): Promise<any> {
  let tokenData;

  if (typeof window !== "undefined") {
    tokenData = JSON.parse(localStorage.getItem("tokenData") || "{}");
  } else {
    tokenData = {};
  }

  let token = spotify
    ? tokenData.spotify_access_token
    : tokenData.jwt_access_token;
  let refreshing = false;

  const makeRequest = async (token: string) => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(JSON.stringify(errorData));
    }

    return response.json();
  };

  if (spotify) {
    const now = Date.now();
    const tokenExpiry = tokenData.spotify_token_expiry || 0;

    if (now >= tokenExpiry) {
      if (!refreshing) {
        refreshing = true;
        tokenData = await refreshSpotifyToken();
        token = tokenData.spotify_access_token;
      }
    }
  } else if (isTokenExpired()) {
    if (!refreshing) {
      refreshing = true;
      tokenData = await refreshJwtToken();
      token = tokenData.jwt_access_token;
    }
  }

  return await makeRequest(token);
}

export {
  getToken,
  refreshJwtToken,
  refreshSpotifyToken,
  getJwtToken,
  getSpotifyToken,
  fetchWithToken,
  BASE_URL,
  LOGIN_URL,
};

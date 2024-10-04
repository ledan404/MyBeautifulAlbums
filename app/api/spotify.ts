import { fetchWithToken, BASE_URL} from "./auth";

async function searchSpotifyAlbums(query: string, offset: number = 0, limit: number = 20): Promise<any> {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=${limit}&offset=${offset}`;

  try {
    const data = await fetchWithToken(true, url);
    return data.albums.items;
  } catch (error) {
    console.error("Error searching Spotify albums:", error);
    throw error;
  }
}

export { searchSpotifyAlbums };

export async function syncSpotifyLibrary(): Promise<void> {
  try {
    const response = await fetchWithToken(
      false,
      `${BASE_URL}/sync-spotify-library/`,
      {
        method: "POST",
      },
    );

    if (typeof response === "object" && response !== null) {
      if ("error" in response) {
        throw new Error(response.error || "Failed to sync Spotify library");
      }
      console.log("Library synced successfully");
    } else {
      console.log("Unexpected response format", response);
      throw new Error("Unexpected response format");
    }
  } catch (error) {
    console.error("Error syncing Spotify library:", error);
    throw error;
  }
}

export async function addAlbumToLibrary(
  albumId: string,
  action: {
    type: "isLiked" | "isLoved" | "isListened" | "wantToListen" | "";
    value: boolean;
  },
): Promise<void> {
  try {
    const response = await fetchWithToken(
      false,
      
      `${BASE_URL}/add_album/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          album_id: albumId,
          action: action,
        }),
      },
    );
    console.log("Album added to library successfully");
  } catch (error) {
    console.error("Error adding album to library:", error);
    throw error; 
  }
}

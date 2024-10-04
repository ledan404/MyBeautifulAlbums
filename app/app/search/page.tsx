"use client";
import React, { useState, useEffect } from "react";
import { Spacer } from "@nextui-org/spacer";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useRouter, useSearchParams } from "next/navigation";

import { AlbumCardSkeleton } from "@/components/album-card-skeleton";
import { AlbumCard } from "@/components/album-card";
import { searchSpotifyAlbums, addAlbumToLibrary } from "@/api/spotify";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const searchParams = useSearchParams();


  useEffect(() => {
    const initialQuery = searchParams.get("q"); 
    setQuery(initialQuery || "");
    if (initialQuery) { 
      handleSearch(initialQuery);
    }
  }, []);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError("");
    setOffset(0);

    try {
      const results = await searchSpotifyAlbums(searchQuery, 0, 20);

      setAlbums(results);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } catch (err) {
      setError("Failed to search albums. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreAlbums = async () => {
    setIsLoading(true);
    try {
      const results = await searchSpotifyAlbums(query, offset + 20, 20);

      setAlbums((prevAlbums) => [...prevAlbums, ...results]);
      setOffset((prevOffset) => prevOffset + 20);
    } catch (err) {
      setError("Failed to load more albums. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToLibrary = async (
    albumId: string,
    action: {
      type: "isLiked" | "isLoved" | "isListened" | "wantToListen";
      value: boolean;
    },
  ) => {
    if (!albumId) {
      setError("Album ID is required");
      return;
    }
  
    try {
      await addAlbumToLibrary(albumId, action);
    } catch (err) {
      setError("Failed to add album to library. Please try again.");
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="wrapper justify-center items-center">
      <div className="min-h-20 bg-foreground-100 rounded-xl flex sm:flex-row flex-col justify-center items-center gap-2 p-4">
        <p className="text-3xl font-bold">Search albums</p>
      </div>
      <Spacer y={5} />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Search for albums..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            className="sm:w-1/3 w-full"
            disabled={isLoading}
            variant="ghost"
            onClick={() => handleSearch()}
          >
            Search
          </Button>
        </div>
        {error && <p className="text-danger">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <AlbumCardSkeleton key={index} />
              ))
            : albums.map((album: any) => (
                <AlbumCard
                recordId={album.record_id}
                key={album.id}
                id="0"
                albumId={album.id}
                artist={album.artists[0]?.name}
                imageUrl={album.images[0]?.url}
                name={album.name}
                releaseYear={new Date(album.release_date).getFullYear()}
                onAddToLibrary={handleAddToLibrary} onDeleteRecord={function (recordId: string): Promise<void> {
                  throw new Error("Function not implemented.");
                } }                />
              ))}
        </div>
        {albums.length > 0 && (
          <Button
            disabled={isLoading || albums.length === 0}
            onClick={loadMoreAlbums}
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        )}
      </div>
    </div>
  );
}
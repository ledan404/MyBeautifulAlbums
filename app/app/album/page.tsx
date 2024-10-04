"use client"
import { Image } from "@nextui-org/image";
import { Divider } from "@nextui-org/divider";
import { Link } from "@nextui-org/link";
import { useEffect, useState } from "react";
import { BASE_URL, fetchWithToken } from "@/api/auth";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@nextui-org/spinner";

interface Artist {
  name: string;
  source_url: string | null;
}

interface Track {
  name: string;
  duration_ms: number;
  track_number: number;
  artist: Artist[];
  source_url: string | null;
}

interface Album {
  id: string;
  name: string;
  artist: Artist[];
  img_url: string;
  release_date: string;
  tracks: Track[];
  genres: string[];
  copyright: string;
  label: string;
  popularity: number;
  source_url: string | null;
}

export default function ClientAlbumPage() {
  const [album, setAlbum] = useState<Album | null>(null);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const data = await fetchWithToken(
          false,
          `${BASE_URL}/albums/${id}/`,
        );

        setAlbum(data);
      } catch (error) {
        console.error("Error fetching album:", error);
      }
    };

    if (id) {
      fetchAlbum();
    }
  }, [id]);

  if (!album) {
    return <Spinner  />;
  }
    
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);

    return `${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="items-center">
      <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-6 p-4 md:p-8">
        <div className="w-full md:w-1/3 max-w-sm">
          <Image
            isBlurred
            alt={album.name}
            className="object-cover shadow-lg w-full"
            src={album.img_url}
          />
        </div>
        <div className="w-full md:min-w-2/3 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-bold mt-2">
            <Link
              isExternal
              className="text-2xl md:text-4xl font-bold mt-2"
              color="foreground"
              href={album.source_url || "#"}
              underline="hover"
            >
              {album.name}
            </Link>
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start items-center mt-4 gap-2">
            <Link
              isExternal
              className="font-bold"
              color="foreground"
              href={album.artist[0].source_url || "#"}
              underline="hover"
            >
              {album.artist[0].name}
            </Link>
            <span className="hidden md:inline mx-2">•</span>
            <span>{new Date(album.release_date).getFullYear()}</span>
            <span className="hidden md:inline mx-2">•</span>
            <span>{album.tracks.length} songs</span>
          </div>
        </div>
      </div>

      <Divider className="my-4" />

      <div className="mt-8">
        <div className="flex flex-col gap-3">
          {album.tracks.map((track, index) => (
            <div
              key={index}
              className="flex items-center p-2 rounded-md bg-foreground-50"
            >
              <div className="w-8 text-center text-default-500">
                {track.track_number}
              </div>
              <div className="flex-grow ml-4 justify-start">
                <div className="font-medium text-xs sm:text-sm flex justify-start text-left">
                  {track.source_url ? (
                    <Link
                      isExternal
                      color="foreground"
                      href={track.source_url}
                      underline="hover"
                    >
                      {track.name}
                    </Link>
                  ) : (
                    track.name
                  )}
                </div>
                <div className="text-xs sm:text-sm flex text-default-500 ">
                  {track.artist.slice(0, 1).map((artist, artistIndex) => (
                    <span key={artistIndex} className="block">
                      {artistIndex > 0 && ", "}
                      {artist.source_url ? (
                        <Link
                          isExternal
                          className="text-left break-word text-default-600"
                          color="foreground"
                          href={artist.source_url}
                          underline="hover"
                        >
                          {artist.name}
                        </Link>
                      ) : (
                        artist.name
                      )}
                    </span>
                  ))}
                  {track.artist.length > 1 && (
                    <span className="sm:hidden text-sm">...</span>
                  )}
                  {track.artist.slice(1).map((artist, artistIndex) => (
                    <span key={artistIndex + 1} className="hidden sm:inline">
                      {", "}
                      {artist.source_url ? (
                        <Link
                          isExternal
                          className="text-left break-word text-default-600"
                          color="foreground"
                          href={artist.source_url}
                          underline="hover"
                        >
                          {artist.name}
                        </Link>
                      ) : (
                        artist.name
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-default-500 pr-3">
                {formatDuration(track.duration_ms)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider className="my-4" />

      <div className="mt-8 text-sm text-default-500 text-left">
        <p>
          {new Date(album.release_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          • {album.label}
        </p>
        <p className="mt-2">{album.copyright}</p>
      </div>
    </div>
  );
}
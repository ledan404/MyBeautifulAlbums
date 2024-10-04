"use client";
import React, { useEffect, useState } from "react";
import { Image } from "@nextui-org/image";
import { Link } from "@nextui-org/link";
import { Button } from "@nextui-org/button";
import { Spacer } from "@nextui-org/spacer";
import { Select, SelectItem } from "@nextui-org/select";
import { Spinner } from "@nextui-org/spinner";

import { BASE_URL, fetchWithToken } from "../../api/auth";

import { AlbumCard } from "@/components/album-card";
import { withAuth } from "@/components/withAuth";
import { useAuth } from "@/hooks/useAuth";
import { syncSpotifyLibrary } from "@/api/spotify";
import {
  HeadphonesIcon,
  HeartIcon,
  PlusIcon,
  WantToListenIcon,
} from "@/components/icons";

interface UserProfile {
  user?: {
    first_name?: string;
    username?: string;
  };
  img_profile_url?: string;
  records?: Array<{
    id: string;
    album: {
      id: string;
      spotify_id: string;
      name: string;
      artist: Array<{ name: string }>;
      img_url: string;
      release_date: string;
    };
    is_liked: boolean;
    is_loved: boolean;
    is_listened: boolean;
    want_to_listen: boolean;
  }>;
}

interface AlbumCardProps {
  recordId: string;
  albumId: string;
  artist: string;
  id: string;
  imageUrl: string;
  isLiked: boolean;
  isListened: boolean;
  isLoved: boolean;
  name: string;
  releaseYear: number;
  wantToListen: boolean;
  onAddToLibrary: (
    albumId: string,
    action: {
      type: "isLiked" | "isLoved" | "isListened" | "wantToListen";
      value: boolean;
    },
  ) => Promise<void>;
  onDeleteRecord: (recordId: string) => Promise<void>;
}

function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const { logout } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const fetchProfile = async () => {
    try {
      console.log("Fetching profile...");
      const data = await fetchWithToken(false, `${BASE_URL}/profile/`);

      console.log("Fetched profile data:", data);
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to fetch profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profile) {
    return <Spinner />;
  }

  const displayName =
    profile.user?.first_name || profile.user?.username || "User";
  const profileImage = profile.img_profile_url || "/default-profile-image.jpg";

  const handleSyncLibrary = async () => {
    try {
      setSyncStatus("Syncing...");
      await syncSpotifyLibrary();
      setSyncStatus("Library synced successfully");
      fetchProfile();
    } catch (error) {
      console.error("Failed to sync library:", error);
      setSyncStatus(
        error instanceof Error ? error.message : "Failed to sync library",
      );
    }
  };

  const filteredRecords =
    profile?.records?.filter((record) => {
      if (selectedFilter === "liked") return record.is_liked;
      if (selectedFilter === "loved") return record.is_loved;
      if (selectedFilter === "just_listened") return record.is_listened;
      if (selectedFilter === "want_to_listen") return record.want_to_listen;

      return true;
    }) || [];

  console.log("Selected Filter:", selectedFilter);

  const handleAddToLibrary = async (
    albumId: string,
    action: {
      type: "isLiked" | "isLoved" | "isListened" | "wantToListen";
      value: boolean;
    },
  ) => {
    console.log(`Adding album ${albumId} to library with action:`, action);
  };

  const handleDeleteRecord = async (recordId: string) => {
    const response = await fetchWithToken(
      false,
      `${BASE_URL}/records/${recordId}/`,
      {
        method: "DELETE",
      },
    );
  };

  return (
    <div className="wrapper justify-center items-center">
      <div className="flex flex-col sm:flex-row w-full text-center mx-auto bg-foreground-100 justify-evenly sm:items-center h-64 rounded-3xl">
        <div className="flex justify-center">
          <Image
            isBlurred
            alt="Profile"
            className="rounded-full"
            height={150}
            radius="full"
            src={profileImage}
            width={150}
          />
        </div>
        <Link
          isExternal
          className="text-5xl text-center justify-center font-bold"
          color="primary"
          href="#"
          size="lg"
          underline="hover"
        >
          {displayName}
        </Link>
      </div>
      <Spacer y={5} />
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="w-full min-w-1/2">
          <Select
            defaultSelectedKeys={["all"]}
            label="Filter"
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;

              console.log("Selected Keys:", keys);
              setSelectedFilter(selectedKey);
            }}
          >
            <SelectItem key="all" value="all">
              All
            </SelectItem>
            <SelectItem key="liked" startContent={<PlusIcon />} value="liked">
              Liked
            </SelectItem>
            <SelectItem key="loved" startContent={<HeartIcon />} value="loved">
              Loved
            </SelectItem>
            <SelectItem
              key="just_listened"
              startContent={<HeadphonesIcon />}
              value="just_listened"
            >
              Just Listened
            </SelectItem>
            <SelectItem
              key="want_to_listen"
              startContent={<WantToListenIcon />}
              value="want_to_listen"
            >
              Want to Listen
            </SelectItem>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full min-w-1/2">
          <Button
            className="w-full h-14"
            size="lg"
            variant="faded"
            onClick={handleSyncLibrary}
          >
            Sync Spotify Library
          </Button>
          <Button
            className="w-full h-14 text-danger"
            size="lg"
            variant="faded"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </div>

      {syncStatus && (
        <p
          className={
            syncStatus.includes("success") ? "text-success" : "text-danger"
          }
          style={{ marginTop: "10px" }}
        >
          {syncStatus}
        </p>
      )}
      <Spacer y={5} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRecords.map((record, index) => (
          <AlbumCard
            key={index}
            albumId={record.album.spotify_id.toString()}
            artist={record.album.artist[0]?.name || "Unknown Artist"}
            id={record.album.id}
            imageUrl={record.album.img_url}
            isLiked={record.is_liked}
            isListened={record.is_listened}
            isLoved={record.is_loved}
            name={record.album.name}
            recordId={record.id}
            releaseYear={new Date(record.album.release_date).getFullYear()}
            wantToListen={record.want_to_listen}
            onAddToLibrary={handleAddToLibrary}
            onDeleteRecord={handleDeleteRecord}
          />
        ))}
      </div>
      <Spacer y={2} />
      <Spacer y={2} />
    </div>
  );
}

export default withAuth(ProfilePage);

import React, { useState } from "react";
import { Card, CardBody } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Button } from "@nextui-org/button";
import { ButtonGroup } from "@nextui-org/button";
import { useRouter, usePathname } from "next/navigation";

import { addAlbumToLibrary } from "@/api/spotify";
import {
  PlusIcon,
  HeartIcon,
  HeadphonesIcon,
  WantToListenIcon,
  MoreIcon,
  TrashIcon,
} from "@/components/icons";
import { BASE_URL, fetchWithToken } from "@/api/auth";

export interface AlbumCardProps {
  recordId: string;
  key: any;
  id: any;
  albumId: any;
  artist: any;
  imageUrl: any;
  name: any;
  releaseYear: number;
  onDeleteRecord: (recordId: string) => Promise<void>;
  onAddToLibrary: (
    albumId: string,
    action: {
      type: "isLiked" | "isLoved" | "isListened" | "wantToListen";
      value: boolean;
    },
  ) => Promise<void>;
  isLiked?: boolean;
  isLoved?: boolean;
  isListened?: boolean;
  wantToListen?: boolean;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
  recordId,
  albumId,
  id,
  name,
  artist,
  imageUrl,
  releaseYear,
  isLiked: initialIsLiked = false,
  isLoved: initialIsLoved = false,
  isListened: initialIsListened = false,
  wantToListen: initialWantToListen = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoved, setIsLoved] = useState(initialIsLoved);
  const [isListened, setIsListened] = useState(initialIsListened);
  const [wantToListen, setWantToListen] = useState(initialWantToListen);

  const handleAction = async (
    action: "like" | "love" | "listen" | "wantToListen",
  ) => {
    let newState;

    switch (action) {
      case "like":
        newState = !isLiked;
        setIsLiked(newState);
        break;
      case "love":
        newState = !isLoved;
        setIsLoved(newState);
        break;
      case "listen":
        newState = !isListened;
        setIsListened(newState);
        break;
      case "wantToListen":
        newState = !wantToListen;
        setWantToListen(newState);
        break;
    }

    await addAlbumToLibrary(albumId, {
      type:
        action === "like"
          ? "isLiked"
          : action === "love"
            ? "isLoved"
            : action === "listen"
              ? "isListened"
              : action === "wantToListen"
                ? "wantToListen"
                : "",
      value: newState,
    });
  };

  const handleDeleteFormLibrary = async (recordId: string) => {
    await fetchWithToken(false, `${BASE_URL}/records/${recordId}/`, {
      method: "DELETE",
    });
  };

  const handleMoreClick = () => {
    router.push(`/album?id=${id}`);
  };

  return (
    <Card className="dark:bg-foreground-50">
      <CardBody>
        <div className="flex flex-col gap-4">
          <Image
            alt={name}
            className="object-cover rounded-xl"
            src={imageUrl}
          />
          <div className="flex flex-col flex-1">
            <p className="text-md font-bold">{name}</p>
            <p className="text-small text-default-500">{artist}</p>
            <p className="text-small text-default-400">{releaseYear}</p>
          </div>
          <div className="flex justify-between">
            <ButtonGroup
              isIconOnly
              className="justify-end"
              radius="sm"
              size="lg"
            >
              <Button
                isIconOnly
                color={isLiked ? "primary" : "default"}
                size="sm"
                onClick={() => handleAction("like")}
              >
                <PlusIcon />
              </Button>
              <Button
                color={isLoved ? "primary" : "default"}
                size="sm"
                onClick={() => handleAction("love")}
              >
                <HeartIcon />
              </Button>
              <Button
                color={isListened ? "primary" : "default"}
                size="sm"
                onClick={() => handleAction("listen")}
              >
                <HeadphonesIcon />
              </Button>
              <Button
                color={wantToListen ? "primary" : "default"}
                size="sm"
                onClick={() => handleAction("wantToListen")}
              >
                <WantToListenIcon />
              </Button>
              {pathname !== "/search" && (
                <Button
                  color="default"
                  size="sm"
                  onPress={() => {
                    handleDeleteFormLibrary(recordId);
                    window.location.reload();
                  }}
                >
                  <TrashIcon />
                </Button>
              )}
            </ButtonGroup>
            {pathname !== "/search" && (
              <div className="">
                <Button color="default" size="md" onPress={handleMoreClick}>
                  <MoreIcon />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

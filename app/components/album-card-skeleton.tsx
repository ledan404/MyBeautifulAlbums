import React from "react";
import { Card, CardBody } from "@nextui-org/card";
import { Skeleton } from "@nextui-org/skeleton";

export const AlbumCardSkeleton: React.FC = () => {
  return (
    <Card className="dark:bg-foreground-50">
      <CardBody>
        <div className="flex flex-col gap-4">
          <Skeleton className="rounded-xl aspect-square" />
          <div className="flex flex-col flex-1 gap-2">
            <Skeleton className="w-3/4 h-4 rounded-lg" />
            <Skeleton className="w-1/2 h-3 rounded-lg" />
            <Skeleton className="w-1/4 h-3 rounded-lg" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="w-3/4 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

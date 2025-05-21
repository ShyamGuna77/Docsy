/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { toast } from "sonner";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { FullscreenLoader } from "@/components/fullscreen-loader";
import { LEFT_MARGIN_DEFAULT, RIGHT_MARGIN_DEFAULT } from "@/constants/margin";

import { getUsers, getDocuments } from "./actions";
import { Id } from "../../../../convex/_generated/dataModel";

type User = { id: string; name: string; avatar: string; color: string };

export function Room({ children }: { children: ReactNode }) {
  const params = useParams();

  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useMemo(
    () => async () => {
      try {
        const list = await getUsers();
        setUsers(list);
      } catch {
        toast.error("Failed to fetch users");
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <LiveblocksProvider
      throttle={16}
      authEndpoint={async () => {
        const endpoint = "/api/liveblocks-auth";
        const room = params.documentId as string;
        let retries = 3;
        let lastError;

        while (retries > 0) {
          try {
            console.log("Attempting Liveblocks auth for room:", room);
            const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ room }),
            });

            if (!response.ok) {
              const error = await response.json();
              console.error("Liveblocks auth error:", error);
              throw new Error(
                error.error || `HTTP error! status: ${response.status}`
              );
            }

            const data = await response.json();
            console.log("Liveblocks auth successful:", data);
            return data;
          } catch (error) {
            console.error(
              `Liveblocks auth attempt ${4 - retries} failed:`,
              error
            );
            lastError = error;
            retries--;
            if (retries > 0) {
              await new Promise((resolve) =>
                setTimeout(resolve, (4 - retries) * 1000)
              );
            }
          }
        }

        toast.error(
          "Failed to connect to collaboration server. Please refresh the page."
        );
        throw lastError;
      }}
      resolveUsers={({ userIds }) => {
        console.log("Resolving users:", userIds);
        const resolvedUsers = userIds.map(
          (userId) => users.find((user) => user.id === userId) ?? undefined
        );
        console.log("Resolved users:", resolvedUsers);
        return resolvedUsers;
      }}
      resolveMentionSuggestions={({ text }) => {
        console.log("Resolving mentions for text:", text);
        let filteredUsers = users;

        if (text) {
          filteredUsers = users.filter((user) =>
            user.name.toLowerCase().includes(text.toLowerCase())
          );
        }

        const suggestions = filteredUsers.map((user) => user.id);
        console.log("Mention suggestions:", suggestions);
        return suggestions;
      }}
      resolveRoomsInfo={async ({ roomIds }) => {
        console.log("Resolving room info for:", roomIds);
        const documents = await getDocuments(roomIds as Id<"documents">[]);
        const roomInfo = documents.map((document: any) => ({
          id: document.id,
          name: document.name,
        }));
        console.log("Resolved room info:", roomInfo);
        return roomInfo;
      }}
    >
      <RoomProvider
        id={params.documentId as string}
        initialStorage={{
          leftMargin: LEFT_MARGIN_DEFAULT,
          rightMargin: RIGHT_MARGIN_DEFAULT,
        }}
      >
        <ClientSideSuspense
          fallback={<FullscreenLoader label="Room loading..." />}
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

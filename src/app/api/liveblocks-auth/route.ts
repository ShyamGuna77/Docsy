import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { auth, currentUser } from "@clerk/nextjs/server";

import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(req: Request) {
  try {
    const { sessionClaims } = await auth();
    if (!sessionClaims) {
      console.error("No session claims found");
      return new Response(JSON.stringify({ error: "No session claims" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await currentUser();
    if (!user) {
      console.error("No current user found");
      return new Response(JSON.stringify({ error: "No current user" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { room } = await req.json();
    console.log("Authenticating for room:", room, "user:", user.id);

    const document = await convex.query(api.documents.getById, { id: room });
    if (!document) {
      console.error("Document not found:", room);
      return new Response(JSON.stringify({ error: "Document not found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const isOwner = document.ownerId === user.id;
    const isOrganizationMember = !!(
      document.organizationId &&
      document.organizationId === sessionClaims.org_id
    );

    if (!isOwner && !isOrganizationMember) {
      console.error("User not authorized:", user.id);
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const name =
      user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous";
    const nameToNumber = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = Math.abs(nameToNumber) % 360;
    const color = `hsl(${hue}, 80%, 60%)`;

    console.log("Creating Liveblocks session for user:", {
      id: user.id,
      name,
      avatar: user.imageUrl,
      color,
    });

    const session = liveblocks.prepareSession(user.id, {
      userInfo: {
        name,
        avatar: user.imageUrl,
        color,
      },
    });

    session.allow(room, session.FULL_ACCESS);
    const { body, status } = await session.authorize();

    console.log("Liveblocks session authorized successfully");
    return new Response(body, {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

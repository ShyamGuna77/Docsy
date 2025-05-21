import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { notFound } from "next/navigation";

import { Document } from "./document";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface DocumentIdPageProps {
  params: Promise<{ documentId: Id<"documents"> }>;
}

const DocumentIdPage = async ({ params }: DocumentIdPageProps) => {
  const { documentId } = await params;

  const { getToken } = await auth();
  const token = (await getToken({ template: "convex" })) ?? undefined;

  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    const preloadedDocument = await preloadQuery(
      api.documents.getById,
      { id: documentId },
      { token }
    );

    return <Document preloadedDocument={preloadedDocument} />;
  } catch (error) {
    if (error instanceof Error && error.message === "Document not found") {
      notFound();
    }
    throw error;
  }
};

export default DocumentIdPage;

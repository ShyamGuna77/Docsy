import { ClientSideSuspense, useThreads } from "@liveblocks/react/suspense";
import {
  AnchoredThreads,
  FloatingComposer,
  FloatingThreads,
} from "@liveblocks/react-tiptap";
import { Editor } from "@tiptap/react";
import { toast } from "sonner";

export const Threads = ({ editor }: { editor: Editor | null }) => {
  return (
    <ClientSideSuspense
      fallback={<div className="loading">Loading threads...</div>}
    >
      <ThreadsList editor={editor} />
    </ClientSideSuspense>
  );
};

function ThreadsList({ editor }: { editor: Editor | null }) {
  const { threads, error } = useThreads({ query: { resolved: false } });

  if (error) {
    console.error("Threads error:", error);
    toast.error("Failed to load threads");
    return null;
  }

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className="anchored-threads">
        <AnchoredThreads editor={editor} threads={threads} />
      </div>
      <FloatingThreads
        editor={editor}
        threads={threads}
        className="floating-threads"
      />
      <FloatingComposer editor={editor} className="floating-composer" />
    </>
  );
}

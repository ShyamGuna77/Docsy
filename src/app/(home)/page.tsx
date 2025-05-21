
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Link href="/landing">
        <Button>Click Me </Button>
      </Link>
    </div>
  );
}

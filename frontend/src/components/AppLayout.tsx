import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Aside from "./Aside";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
};

export default function AppLayout({ children }: Props) {
  const [open, setOpen] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebar:open");
      if (stored != null) setOpen(stored === "true");
    } catch {}
  }, []);

  return (
    <div className="flex">
      <Aside open={open} onToggle={setOpen} />
      <main
        className={cn(
          "min-h-dvh flex-1 transition-[margin-inline,width] duration-300 p-4",
          open ? "ml-0" : "ml-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}

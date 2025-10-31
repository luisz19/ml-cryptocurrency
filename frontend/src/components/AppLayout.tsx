import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Aside from "./Aside";
import Header from "./Header";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
};

export default function AppLayout({ children }: Props) {
  const [open, setOpen] = useState<boolean>(true);
  const location = useLocation();

  const title = (() => {
    const path = location.pathname.split("/")[1] || "dashboard";
    const map: Record<string, string> = {
      dashboard: "Dashboard",
      statistics: "Estatísticas",
      recommendations: "Recomendações",
      profile: "Configurações",
      "form-profile-risk": "Perfil de Risco",
      ui: "Componentes UI",
    };
    return map[path] ?? "Aplicação";
  })();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebar:open");
      if (stored != null) setOpen(stored === "true");
    } catch {}
  }, []);

  return (
    <div className="flex">
      <Aside open={open} onToggle={setOpen} />
      <div className="flex-1 min-h-dvh flex flex-col">
        <Header title={title} />
        <main
        className={cn(
          "flex-1 transition-[margin-inline,width] duration-300 p-4",
          open ? "ml-0" : "ml-0"
        )}
      >
          {children}
        </main>
      </div>
    </div>
  );
}

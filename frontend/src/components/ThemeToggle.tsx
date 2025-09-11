import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/Button";

function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // Sync with current DOM state on mount
    const root = document.documentElement;
    const hasDark = root.classList.contains("dark");
    setIsDark(hasDark);
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = !isDark;
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setIsDark(next);
  };

  return (
    <Button
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      onClick={toggle}
      variant="outline"
      size="icon"
      className="rounded-full shadow-sm"
      title={isDark ? "Modo claro" : "Modo escuro"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

export default ThemeToggle;

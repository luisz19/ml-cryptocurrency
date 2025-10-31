import { Link } from "react-router-dom";
import { Card } from "./ui/Card";
import ThemeToggle from "./ThemeToggle";
import { User } from "lucide-react";

type HeaderProps = {
  title: string;
};

const Header = ({ title }: HeaderProps) => {
  return (
    <header className=" top-0  z-40 sticky flex justify-between items-center border-b border-border px-5 backdrop-blur  transition-colors">
      <h1 className="text-lg md:text-xl font-semibold">{title}</h1>

      <Card className="gap-2 p-2 m-3 flex ">
          <Link
            to="/profile"
            aria-label="Ir para o perfil"
            className="inline-flex items-center justify-center size-9 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Perfil"
          >
            <User className="size-4" />
          </Link>
          <ThemeToggle />


      </Card>
    </header>
  );
}

export default Header;
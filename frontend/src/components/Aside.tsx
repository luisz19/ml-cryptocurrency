import { NavLink, useNavigate } from "react-router-dom";
import {
	LayoutGrid,
	BarChart3,
	ShoppingBag,
	Settings,
	LogOut,
	PanelLeftClose,
	PanelRightOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import Logo from "@/assets/crypto-lens.svg";
import LogoLight from "@/assets/crypto-lens-light.svg";

type Props = {
	open?: boolean;
	onToggle?: (open: boolean) => void;
};

export default function Aside({ open, onToggle }: Props) {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState<boolean>(open ?? true);
	const [isDark, setIsDark] = useState<boolean>(() => {
		if (typeof document === "undefined") return false;
		return document.documentElement.classList.contains("dark");
	});

	useEffect(() => {
		if (typeof document === "undefined") return;
		const root = document.documentElement;
		const update = () => setIsDark(root.classList.contains("dark"));

		const observer = new MutationObserver(update);
		observer.observe(root, { attributes: true, attributeFilter: ["class"] });

		const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
		const mqHandler = () => update();
		mq?.addEventListener?.("change", mqHandler);

		const storageHandler = (e: StorageEvent) => {
			if (e.key === "theme") update();
		};
		window.addEventListener("storage", storageHandler);

		update();
		return () => {
			observer.disconnect();
			mq?.removeEventListener?.("change", mqHandler);
			window.removeEventListener("storage", storageHandler);
		};
	}, []);

	useEffect(() => {
		if (open !== undefined) setIsOpen(open);
	}, [open]);

	useEffect(() => {
		try {
			localStorage.setItem("sidebar:open", String(isOpen));
		} catch {}
	}, [isOpen]);

	const handleToggle = () => {
		const next = !isOpen;
		setIsOpen(next);
		onToggle?.(next);
	};

	const itemBase =
		"group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground";
	const itemActive = "bg-primary/15 text-foreground";
	const iconClass = "size-5 text-muted-foreground group-hover:text-foreground";

	return (
		<aside
			className={cn(
				"bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-dvh sticky top-0 transition-[width] duration-300 flex flex-col",
				isOpen ? "w-64" : "w-16"
			)}
			aria-label="Navegação lateral"
		>
			<div className="flex h-14 items-center justify-center px-2 mt-2">
				<Button
					size="icon"
					variant="outline"
					onClick={handleToggle}
					aria-label={isOpen ? "Recolher menu" : "Expandir menu"}
					className="shrink-0"
					title={isOpen ? "Recolher" : "Expandir"}
				>
					{isOpen ? (
						<PanelLeftClose className="size-4" />
					) : (
						<PanelRightOpen className="size-4" />
					)}
				</Button>
			</div>
			<div
				className={cn(
					"flex justify-center my-4 overflow-hidden transition-all duration-300 ease-in-out ",
					isOpen ? "opacity-100 max-h-10" : "opacity-0 max-h-0"
				)}
				aria-hidden={!isOpen}
			>
				<img
					src={isDark ? Logo : LogoLight}
					alt="Logo"
					className={cn(
						"h-5 select-none pointer-events-none transition-transform duration-300",
						isOpen ? "scale-100" : "scale-95"
					)}
				/>
			</div>
			<nav className="px-2 py-2 space-y-1 flex-1 overflow-y-auto">
				<NavLink
					to="/dashboard"
					className={({ isActive }) => cn(itemBase, isActive && itemActive)}
				>
					<LayoutGrid className={iconClass} />
					{isOpen && <span>Dashboard</span>}
				</NavLink>
				<NavLink
					to="/statistics"
					className={({ isActive }) => cn(itemBase, isActive && itemActive)}
				>
					<BarChart3 className={iconClass} />
					{isOpen && <span>Estatísticas</span>}
				</NavLink>
				<NavLink
					to="/recommendations"
					className={({ isActive }) => cn(itemBase, isActive && itemActive)}
				>
					<ShoppingBag className={iconClass} />
					{isOpen && <span>Recomendações</span>}
				</NavLink>
			</nav>

			<div className="mt-auto px-2 py-4 space-y-1">
				<NavLink
					to="/profile"
					className={({ isActive }) => cn(itemBase, isActive && itemActive)}
				>
					<Settings className={iconClass} />
					{isOpen && <span>Configurações</span>}
				</NavLink>
				<button
					onClick={() => navigate("/")}
					className={cn(itemBase, "w-full text-left")}
				>
					<LogOut className={iconClass} />
					{isOpen && <span>Logout</span>}
				</button>
			</div>
		</aside>
	);
}


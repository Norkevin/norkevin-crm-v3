"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Crosshair,
  Camera,
  CalendarDays,
  CreditCard,
  Settings,
  Menu,
  Download,
  Upload,
  RotateCcw,
  LogOut,
  ChevronDown,
  Search,
  Plus,
  FileText,
  UserPlus,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useCRM } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { useRef, useState } from "react";
import { toast } from "sonner";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/leads", label: "Leads", icon: Crosshair },
  { href: "/jobs", label: "Jobs", icon: Camera },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const settings = useCRM((s) => s.settings);
  const ownerName = settings.ownerName || "Studio Owner";
  const initials = ownerName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-sn-nav text-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-2 px-4">
        {/* Mobile menu */}
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="rounded-md p-2 hover:bg-white/10" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sn-nav text-white border-white/10 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="border-b border-white/10 p-4">
                <Logo light />
              </div>
              <nav className="flex flex-col p-2">
                {NAV.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                        active ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/dashboard" className="mr-4 flex items-center">
          <Logo light />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex flex-col items-center gap-0.5 rounded-md px-4 py-2 text-[11px] font-medium tracking-wide transition-colors",
                  active ? "text-white" : "text-white/70 hover:text-white",
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px]", active && "text-primary")} strokeWidth={2} />
                <span>{item.label}</span>
                <span
                  className={cn(
                    "absolute -bottom-[10px] h-[3px] w-full rounded-full bg-primary transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right: search, quick-add, studio switcher + avatar */}
        <div className="ml-auto flex items-center gap-2">
          <SearchButton />
          <QuickAdd />
          <div className="hidden items-center gap-2 rounded-full bg-white/10 py-1 pl-3 pr-2 text-xs font-medium xl:flex">
            <span className="max-w-[130px] truncate">{settings.studioName}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </div>
          <UserMenu initials={initials} name={ownerName} email={settings.email} />
        </div>
      </div>
    </header>
  );
}

function SearchButton() {
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  return (
    <>
      <button
        onClick={() => setSearchOpen(true)}
        className="flex items-center justify-center rounded-md p-2 text-white/80 transition hover:bg-white/10 md:hidden"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>
      <button
        onClick={() => setSearchOpen(true)}
        className="hidden items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs text-white/70 transition hover:bg-white/15 md:flex"
      >
        <Search className="h-4 w-4" />
        <span>Search…</span>
        <kbd className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
      </button>
    </>
  );
}

function QuickAdd() {
  const openQuick = useUI((s) => s.openQuick);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-9 items-center gap-1 rounded-md bg-primary px-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Add new</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => openQuick("lead")}>
          <Crosshair className="mr-2 h-4 w-4" /> New lead
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openQuick("job")}>
          <Camera className="mr-2 h-4 w-4" /> New job
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openQuick("client")}>
          <UserPlus className="mr-2 h-4 w-4" /> New client
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openQuick("appointment")}>
          <CalendarDays className="mr-2 h-4 w-4" /> New event
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => openQuick("invoice")}>
          <FileText className="mr-2 h-4 w-4" /> New invoice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openQuick("quote")}>
          <CreditCard className="mr-2 h-4 w-4" /> New quote
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({ initials, name, email }: { initials: string; name: string; email: string }) {
  const exportData = useCRM((s) => s.exportData);
  const importData = useCRM((s) => s.importData);
  const resetData = useCRM((s) => s.resetData);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studio-ninja-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importData(String(reader.result));
      if (ok) toast.success("Backup restored successfully");
      else toast.error("Invalid backup file");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full outline-none ring-primary transition focus-visible:ring-2">
            <Avatar className="h-9 w-9 border-2 border-white/30">
              <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-semibold">{name}</span>
              <span className="text-xs font-normal text-muted-foreground">{email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" /> Studio settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Download backup
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Restore backup
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => {
              if (confirm("Reset all data to the sample dataset? This cannot be undone.")) {
                resetData();
                toast.success("Data reset to sample");
              }
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reset sample data
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

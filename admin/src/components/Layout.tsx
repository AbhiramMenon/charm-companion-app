import { useRef, useState } from "react";
import {
  BookOpen, BookText, ChevronRight, ChevronDown, Download, FileText, Upload,
  GraduationCap, LayoutDashboard, Lightbulb, LogOut, Star,
  Map, Menu, Newspaper, StickyNote, X, Users, IndianRupee,
  MessageSquare, Bell, CalendarDays, BarChart2,
  Info, Wallet, ClipboardList,
} from "lucide-react";
import type { Page } from "../App";
import { currentUser, logout } from "../lib/auth";
import { exportExcel, importExcel } from "../lib/excel";
import { useStore } from "../App";
import type { Store } from "../lib/data";

type NavGroup = { label: string; items: { id: Page; label: string; icon: typeof LayoutDashboard }[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Content",
    items: [
      { id: "dashboard",  label: "Dashboard",    icon: LayoutDashboard },
      { id: "exams",      label: "Exams",        icon: GraduationCap   },
      { id: "subjects",   label: "Subjects",     icon: BookOpen        },
      { id: "chapters",   label: "Chapters",     icon: BookText        },
      { id: "topics",     label: "Topics",       icon: FileText        },
      { id: "tricks",     label: "Tricks",       icon: Lightbulb       },
      { id: "notes",      label: "Short Notes",  icon: StickyNote      },
      { id: "maps",       label: "Topic Maps",   icon: Map             },
      { id: "news",       label: "Exam News",    icon: Newspaper       },
      { id: "trickofday", label: "Trick of Day", icon: CalendarDays    },
      { id: "mocktests",  label: "Mock Tests",   icon: ClipboardList   },
    ],
  },
  {
    label: "Users & Analytics",
    items: [
      { id: "users",     label: "Users",        icon: Users          },
      { id: "revenue",   label: "Revenue",      icon: IndianRupee    },
      { id: "ratings",   label: "Ratings",      icon: Star           },
      { id: "issues",    label: "User Issues",  icon: MessageSquare  },
      { id: "analytics", label: "Analytics",    icon: BarChart2      },
      { id: "pricing",   label: "Pricing",      icon: Wallet         },
    ],
  },
  {
    label: "Engagement",
    items: [
      { id: "notifications", label: "Notifications", icon: Bell  },
    ],
  },
  {
    label: "App Settings",
    items: [
      { id: "about", label: "About Section", icon: Info },
    ],
  },
];

export function Layout({
  page, onNavigate, onLogout, onStoreImport, children,
}: {
  page: Page;
  onNavigate: (p: Page) => void;
  onLogout: () => void;
  onStoreImport: (s: Store) => void;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [importing, setImporting]     = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (label: string) =>
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  const fileRef = useRef<HTMLInputElement>(null);
  const { store } = useStore();
  const user = currentUser();

  const handleLogout = () => { logout(); onLogout(); };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const partial = await importExcel(file);
      onStoreImport({ ...store, ...partial } as Store);
      alert("Import successful! Store updated.");
    } catch {
      alert("Import failed. Please check the Excel file format.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)] ${mobile ? "w-64" : "w-60"}`}>
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border)]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gold-gradient">
          <ChevronRight className="h-4 w-4 text-[#1a1410] font-black" />
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--foreground)] leading-none">KrackIT</p>
          <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">Admin Panel</p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV_GROUPS.map((group) => {
          const collapsed = collapsedGroups[group.label];
          const hasActive = group.items.some((i) => i.id === page);
          return (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center justify-between px-3 py-1.5 mb-0.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors group"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]/70 group-hover:text-[var(--muted-foreground)]">
                  {group.label}
                  {hasActive && !collapsed && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)] align-middle" />}
                </p>
                {collapsed
                  ? <ChevronRight className="h-3 w-3 text-[var(--muted-foreground)]/50" />
                  : <ChevronDown  className="h-3 w-3 text-[var(--muted-foreground)]/50" />
                }
              </button>
              {!collapsed && (
                <div className="space-y-0.5 mb-2">
                  {group.items.map(({ id, label, icon: Icon }) => {
                    const active = page === id;
                    return (
                      <button
                        key={id}
                        onClick={() => { onNavigate(id); setSidebarOpen(false); }}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                            : "text-[var(--muted-foreground)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Export / Import / user */}
      <div className="border-t border-[var(--border)] p-3 space-y-1">
        <button
          onClick={() => exportExcel(store)}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export Excel
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-sky-400 hover:bg-sky-400/10 transition-colors disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {importing ? "Importing…" : "Import Excel"}
        </button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />

        <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gold-gradient text-[10px] font-bold text-[#1a1410]">
            {(user ?? "A")[0].toUpperCase()}
          </div>
          <span className="flex-1 truncate text-xs text-[var(--muted-foreground)]">{user}</span>
          <button onClick={handleLogout} title="Sign out" className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );

  const allNavItems = NAV_GROUPS.flatMap((g) => g.items);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex h-full">
            <Sidebar mobile />
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-0 translate-x-full ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-[var(--foreground)]">
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {allNavItems.find((n) => n.id === page)?.label ?? "KrackIT Admin"}
          </p>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

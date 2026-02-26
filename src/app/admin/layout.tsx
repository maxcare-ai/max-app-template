"use client";

import { useEffect, useRef, useState } from "react";
import {
  AppBridgeProvider,
  useAppBridgeContext,
  startResizeObserver,
} from "@max-ai/app-bridge";
import {
  useVisibleViewport,
  ViewportProvider,
} from "@/lib/hooks/use-visible-viewport";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AdminBridgeContext,
  useAdminBridge,
  useAdminBridgeState,
} from "@/lib/bridge";

interface Facility { id: string; name: string }

function FacilitySelect({ facilities, value, onChange }: {
  facilities: Facility[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = facilities.find((f) => f.id === value);
  const hasFacilities = facilities.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => hasFacilities && setOpen((o) => !o)}
        className={`flex items-center justify-between w-[260px] h-10 px-3 text-sm border border-input bg-background rounded-md transition-colors ${hasFacilities ? "hover:bg-accent/50 cursor-pointer" : "cursor-default"}`}
      >
        <span className="flex items-center justify-between w-full gap-2">
          <span className={selected ? "text-foreground" : "text-muted-foreground"}>
            {selected?.name ?? "No facility"}
          </span>
          <svg className="h-4 w-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
          </svg>
        </span>
      </button>
      {open && hasFacilities && (
        <div className="absolute right-0 top-full mt-1 w-full z-50 rounded-md border bg-popover shadow-md overflow-hidden">
          <div className="p-1">
            {facilities.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => { onChange(f.id); setOpen(false); }}
                className={`w-full text-left px-2 py-1.5 text-sm rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground ${f.id === value ? "font-medium" : ""}`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminNav() {
  const { facilities, selectedFacilityId, setSelectedFacilityId } = useAdminBridge();
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    // Add your nav items here
    ...(process.env.NODE_ENV === "development"
      ? [{ href: "/admin/test", label: "Test" }]
      : []),
  ];

  return (
    <div className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <nav className="flex gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-accent-foreground hover:bg-accent/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <FacilitySelect
            facilities={facilities}
            value={selectedFacilityId}
            onChange={setSelectedFacilityId}
          />
        </div>
      </div>
    </div>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { ready } = useAdminBridge();
  const [timedOut, setTimedOut] = useState(false);
  const viewport = useVisibleViewport();

  useEffect(() => {
    return startResizeObserver();
  }, []);

  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => setTimedOut(true), 10_000);
    return () => clearTimeout(timer);
  }, [ready]);

  return (
    <ViewportProvider value={viewport}>
      <div className="bg-background">
        <AdminNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {!ready && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-muted text-sm">
              {timedOut ? (
                <div className="space-y-2">
                  <p className="font-medium text-destructive">
                    Could not connect to MaxAI dashboard
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {"The app bridge did not receive an "}
                    <code className="bg-background px-1 rounded">init</code>
                    {" event. Make sure this app is opened from the MaxAI dashboard and is installed for your organization."}
                  </p>
                </div>
              ) : (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="animate-spin inline-block h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  <span>Connecting to MaxAI dashboard...</span>
                </span>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </ViewportProvider>
  );
}

function EmbeddedContent({ children }: { children: React.ReactNode }) {
  const bridgeCtx = useAppBridgeContext();
  const adminCtx = useAdminBridgeState(bridgeCtx);

  return (
    <AdminBridgeContext.Provider value={adminCtx}>
      <AdminShell>{children}</AdminShell>
    </AdminBridgeContext.Provider>
  );
}

function NotEmbedded() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center max-w-md space-y-4">
        <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-foreground">Max App Template</h1>
        <p className="text-muted-foreground text-sm">
          This app must be opened from the MaxAI dashboard. Install it from the marketplace
          and open it within your organization.
        </p>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isEmbedded, setIsEmbedded] = useState<boolean | null>(null);

  useEffect(() => {
    setIsEmbedded(window.self !== window.top);
  }, []);

  if (isEmbedded === null) return null;

  if (!isEmbedded) return <NotEmbedded />;

  return (
    <AppBridgeProvider>
      <EmbeddedContent>{children}</EmbeddedContent>
    </AppBridgeProvider>
  );
}

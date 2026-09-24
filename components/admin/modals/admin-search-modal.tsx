"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AdminSearchResultItem, AdminSearchService } from "@/lib/services/admin-service";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Compass,
  CornerDownLeft,
  FileText,
  FolderTree,
  HelpCircle,
  Images,
  LayoutGrid,
  Loader2,
  MapPin,
  MessageSquare,
  Mountain,
  Search,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ENTITY_ICONS: Record<string, LucideIcon> = {
  trek: MapPin,
  tour: Compass,
  expedition: Mountain,
  category: FolderTree,
  booking: Calendar,
  inquiry: User,
  blog: FileText,
  testimonial: MessageSquare,
  team: Users,
  faq: HelpCircle,
  media: Images,
};

type FlatItem = AdminSearchResultItem & { flatIndex: number };
type Group = { label: string; items: FlatItem[] };

export function AdminSearchModal({ isOpen, onClose }: AdminSearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<AdminSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const trimmedQuery = debouncedQuery.trim();

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setDebouncedQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Run search
  useEffect(() => {
    if (!trimmedQuery) {
      setResults([]);
      setLoading(false);
      setSelectedIndex(0);
      return;
    }

    let isCancelled = false;

    async function executeSearch() {
      setLoading(true);
      try {
        const res = await AdminSearchService.globalSearch(trimmedQuery);
        if (!isCancelled) {
          setResults(res.results || []);
          setSelectedIndex(0);
        }
      } catch {
        if (!isCancelled) setResults([]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    executeSearch();
    return () => {
      isCancelled = true;
    };
  }, [trimmedQuery]);

  // Group results; flat index matches on-screen order for keyboard navigation
  const { groups, flatList } = useMemo(() => {
    const map = new Map<string, AdminSearchResultItem[]>();
    results.forEach((item) => {
      const label = item.typeLabel || "Other";
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(item);
    });

    let counter = 0;
    const groups: Group[] = [];
    const flatList: FlatItem[] = [];

    map.forEach((items, label) => {
      const withIndex = items.map((item) => {
        const flat = { ...item, flatIndex: counter++ };
        flatList.push(flat);
        return flat;
      });
      groups.push({ label, items: withIndex });
    });

    return { groups, flatList };
  }, [results]);

  const handleSelectResult = useCallback(
    (item: AdminSearchResultItem) => {
      onClose();
      router.push(item.route);
    },
    [onClose, router]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (flatList.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatList.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatList.length) % flatList.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = flatList[selectedIndex];
        if (item) handleSelectResult(item);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, flatList, selectedIndex, handleSelectResult]);

  // Keep active row in view
  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const hasResults = flatList.length > 0;
  const showEmpty = trimmedQuery !== "" && !loading && !hasResults;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        // Anchored near the top so the box grows downward instead of jumping around
        className="top-[15vh] translate-y-0 w-[calc(100vw-2rem)] sm:max-w-xl gap-0 overflow-hidden rounded-xl border border-border bg-background p-0 shadow-xl"
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search packages, bookings, inquiries, and other records
        </DialogDescription>

        {/* Input */}
        <div className="flex h-14 items-center gap-3 px-4">
          {loading ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Search className="size-4 shrink-0 text-muted-foreground" />
          )}

          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search packages, bookings, inquiries…"
            className="h-full flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Results */}
        {hasResults && (
          <div
            className={cn(
              "max-h-[min(420px,60vh)] space-y-3 overflow-y-auto border-t border-border p-2 transition-opacity",
              loading && "opacity-60"
            )}
          >
            {groups.map((group) => (
              <div key={group.label}>
                <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  {group.label}
                </p>

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = item.flatIndex === selectedIndex;
                    const Icon = ENTITY_ICONS[item.type] ?? LayoutGrid;

                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        ref={(el) => {
                          itemRefs.current[item.flatIndex] = el;
                        }}
                        type="button"
                        onClick={() => handleSelectResult(item)}
                        onMouseEnter={() => setSelectedIndex(item.flatIndex)}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                          isActive ? "bg-accent" : "bg-transparent"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
                            isActive ? "bg-background" : "bg-muted"
                          )}
                        >
                          <Icon className="size-4 text-muted-foreground" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="block truncate text-xs text-muted-foreground">
                              {item.subtitle}
                            </span>
                          )}
                        </span>

                        <CornerDownLeft
                          className={cn(
                            "hidden size-3.5 shrink-0 text-muted-foreground sm:block",
                            isActive ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {showEmpty && (
          <div className="border-t border-border px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No results for &ldquo;{trimmedQuery}&rdquo;
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different keyword, destination, or ID.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
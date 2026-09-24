"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, useId } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  MapPin,
  Mountain,
  Compass,
  Calendar,
  User,
  FolderTree,
  FileText,
  Images,
  LayoutGrid,
  Loader2,
  MessageSquare,
  Users,
  HelpCircle,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AdminSearchService, AdminSearchResultItem } from "@/lib/services/admin-service";
import { cn } from "@/lib/utils";

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

const PAGE_JUMP = 5;

type FlatItem = AdminSearchResultItem & { flatIndex: number };
type Group = { label: string; items: FlatItem[] };

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-background px-1 font-sans text-[11px] text-muted-foreground">
      {children}
    </kbd>
  );
}

export function AdminSearchModal({ isOpen, onClose }: AdminSearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<AdminSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const uid = useId();
  const listboxId = `${uid}-listbox`;
  const optionId = (index: number) => `${uid}-option-${index}`;

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Only auto-scroll for keyboard moves, never for mouse hover
  const scrollOnChange = useRef(false);

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

  const moveTo = useCallback((updater: (prev: number) => number) => {
    scrollOnChange.current = true;
    setSelectedIndex(updater);
  }, []);

  // Keyboard handling lives on the input so focus never leaves it
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || flatList.length === 0) return;
    const last = flatList.length - 1;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveTo((prev) => (prev >= last ? 0 : prev + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        moveTo((prev) => (prev <= 0 ? last : prev - 1));
        break;
      case "PageDown":
        e.preventDefault();
        moveTo((prev) => Math.min(prev + PAGE_JUMP, last));
        break;
      case "PageUp":
        e.preventDefault();
        moveTo((prev) => Math.max(prev - PAGE_JUMP, 0));
        break;
      case "Enter": {
        e.preventDefault();
        const item = flatList[selectedIndex];
        if (item) handleSelectResult(item);
        break;
      }
    }
  };

  // Scroll the active row into view (keyboard only)
  useEffect(() => {
    if (!scrollOnChange.current) return;
    scrollOnChange.current = false;
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const hasResults = flatList.length > 0;
  const showEmpty = trimmedQuery !== "" && !loading && !hasResults;
  const activeId = hasResults ? optionId(selectedIndex) : undefined;

  const statusMessage = loading
    ? "Searching"
    : showEmpty
      ? `No results for ${trimmedQuery}`
      : hasResults
        ? `${flatList.length} ${flatList.length === 1 ? "result" : "results"} available. Use up and down arrows to navigate, Enter to open.`
        : "";

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

        {/* Screen reader announcements */}
        <p role="status" aria-live="polite" className="sr-only">
          {statusMessage}
        </p>

        {/* Input */}
        <div className="flex h-14 items-center gap-3 px-4">
          {loading ? (
            <Loader2 aria-hidden className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          )}

          <input
            type="text"
            autoFocus
            role="combobox"
            aria-label="Search"
            aria-expanded={hasResults}
            aria-controls={listboxId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search packages, bookings, inquiries…"
            className="h-full flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden className="size-4" />
            </button>
          )}
        </div>

        {/* Results */}
        {hasResults && (
          <>
            <div
              id={listboxId}
              role="listbox"
              aria-label="Search results"
              // Keep focus in the input when clicking inside the list
              onMouseDown={(e) => e.preventDefault()}
              className={cn(
                "max-h-[min(380px,55vh)] space-y-3 overflow-y-auto border-t border-border p-2 transition-opacity",
                loading && "opacity-60"
              )}
            >
              {groups.map((group) => {
                const labelId = `${uid}-group-${group.label.replace(/\s+/g, "-")}`;
                return (
                  <div key={group.label} role="group" aria-labelledby={labelId}>
                    <p
                      id={labelId}
                      className="px-3 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                      {group.label}
                    </p>

                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = item.flatIndex === selectedIndex;
                        const Icon = ENTITY_ICONS[item.type] ?? LayoutGrid;

                        return (
                          <div
                            key={`${item.type}-${item.id}`}
                            id={optionId(item.flatIndex)}
                            ref={(el) => {
                              itemRefs.current[item.flatIndex] = el;
                            }}
                            role="option"
                            aria-selected={isActive}
                            onClick={() => handleSelectResult(item)}
                            // mousemove (not mouseenter) so a still pointer never steals
                            // the highlight while the list scrolls under it
                            onMouseMove={() => {
                              if (!isActive) setSelectedIndex(item.flatIndex);
                            }}
                            className={cn(
                              "relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                              isActive ? "bg-muted" : "bg-transparent"
                            )}
                          >
                            {/* Non-color indicator for the active row */}
                            <span
                              aria-hidden
                              className={cn(
                                "absolute inset-y-2 left-0 w-0.5 rounded-full bg-foreground/70 transition-opacity",
                                isActive ? "opacity-100" : "opacity-0"
                              )}
                            />

                            <span
                              aria-hidden
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors",
                                isActive
                                  ? "border-border bg-background"
                                  : "border-transparent bg-muted"
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
                              aria-hidden
                              className={cn(
                                "hidden size-3.5 shrink-0 text-muted-foreground sm:block",
                                isActive ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Keyboard hints (hidden on touch-sized screens) */}
            <div
              aria-hidden
              className="hidden items-center gap-4 border-t border-border px-4 py-2 text-xs text-muted-foreground sm:flex"
            >
              <span className="inline-flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                Navigate
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Kbd>↵</Kbd>
                Open
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Kbd>Esc</Kbd>
                Close
              </span>
            </div>
          </>
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
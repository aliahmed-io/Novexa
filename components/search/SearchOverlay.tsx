"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Loader2, ShoppingBag } from "lucide-react";
import { useSearch } from "./SearchContext";
import { useDebounce } from "use-debounce";
import type { Product } from "@/lib/assistantTypes";

interface SearchApiResponse {
  results: Product[];
  error?: string;
}

export function SearchOverlay() {
  const { isOpen, closeSearch } = useSearch();
  const [query, setQuery] = React.useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const [results, setResults] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  React.useEffect(() => {
    async function fetchResults() {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: debouncedQuery }),
        });
        const data: SearchApiResponse = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchResults();
  }, [debouncedQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 mx-4 pointer-events-auto"
            >
              <div className="relative flex items-center border-b border-gray-200 dark:border-gray-800 px-6 py-5">
                <Search className="mr-4 h-6 w-6 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask Novexa or search for shoes..."
                  className="flex-1 bg-transparent text-xl outline-none placeholder:text-gray-400 dark:text-white"
                />
                {query ? (
                  <button type="button" onClick={() => setQuery("")}>
                    <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                  </button>
                ) : (
                  <kbd className="hidden md:inline-flex items-center gap-1 rounded border bg-gray-50 px-2 text-xs text-gray-400">
                    <span>ESC</span>
                  </kbd>
                )}
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-950/50">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="animate-pulse">AI is ranking results...</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {results.map((product, index) => (
                      <div
                        key={product.id}
                        className="group relative cursor-pointer rounded-xl border border-gray-200 bg-white p-3 transition-all hover:border-blue-500/50 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
                      >
                        <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-gray-100">
                          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                          {index < 3 && debouncedQuery && (
                            <span className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md shadow-sm">
                              <Sparkles className="h-3 w-3" /> AI Ranked
                            </span>
                          )}
                        </div>
                        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </h3>
                        <div className="mt-1 flex items-end justify-between">
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            ${product.price}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : debouncedQuery ? (
                  <div className="py-16 text-center text-gray-500">
                    <ShoppingBag className="mx-auto h-10 w-10 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No matching products found.</p>
                    <p className="text-sm mt-2">Try checking your spelling or using different keywords.</p>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <Sparkles className="mx-auto h-10 w-10 text-blue-500/30 mb-4" />
                    <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">
                      Smart Search Active
                    </h4>
                    <p className="mt-2 text-sm">
                      Type queries like "comfortable running shoes for men under $150".
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearch } from "./SearchContext";
import { useDebounce } from "use-debounce";
import type { Product } from "@/lib/assistantTypes";

interface SearchApiResponse {
  results: Product[];
  error?: string;
}

export function SearchOverlay() {
  const { isOpen, closeSearch } = useSearch();
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const [results, setResults] = React.useState<Product[]>([]);
  const [aiResults, setAiResults] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [aiLoading, setAiLoading] = React.useState(false);

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
        setAiResults([]);
        return;
      }

      // 1. Standard Search (Fast)
      setLoading(true);
      setAiResults([]); // Clear previous AI results
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: debouncedQuery, searchType: "standard" }),
        });
        const data: SearchApiResponse = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Standard search failed", error);
      } finally {
        setLoading(false);
      }

      // 2. AI Search (Background)
      setAiLoading(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: debouncedQuery, searchType: "ai" }),
        });
        const data: SearchApiResponse = await res.json();
        if (data.results && data.results.length > 0) {
          setAiResults(data.results);
        }
      } catch (error) {
        console.error("AI search failed", error);
      } finally {
        setAiLoading(false);
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
              className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white/40 backdrop-blur-3xl border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] dark:bg-black/40 dark:border-white/10 mx-4 pointer-events-auto ring-1 ring-white/20"
            >
              <div className="relative flex items-center border-b border-white/20 dark:border-white/10 px-6 py-5">
                <Search className="mr-4 h-6 w-6 text-gray-500 dark:text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask Novexa or search for shoes..."
                  className="flex-1 bg-transparent text-xl outline-none placeholder:text-gray-500 text-gray-900 dark:text-white dark:placeholder:text-gray-400"
                />
                {query ? (
                  <button type="button" onClick={() => setQuery("")}>
                    <X className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                  </button>
                ) : (
                  <kbd className="hidden md:inline-flex items-center gap-1 rounded border border-gray-200/50 bg-white/30 px-2 text-xs text-gray-500 dark:border-gray-700/50 dark:bg-black/30 dark:text-gray-400">
                    <span>ESC</span>
                  </kbd>
                )}
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-6 bg-transparent scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="animate-pulse font-medium">Searching...</p>
                  </div>
                ) : results.length > 0 || aiResults.length > 0 ? (
                  <div className="space-y-6">
                    {/* AI Results Section */}
                    {aiLoading ? (
                      <div className="flex items-center gap-2 text-sm text-blue-500 animate-pulse px-1">
                        <Sparkles className="h-4 w-4" />
                        <span>Finding best matches...</span>
                      </div>
                    ) : aiResults.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Recommended for you</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {aiResults.map((product) => (
                            <ProductCard key={`ai-${product.id}`} product={product} closeSearch={closeSearch} router={router} />
                          ))}
                        </div>
                        <div className="border-b border-white/10 my-4" />
                      </div>
                    )}

                    {/* Standard Results */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {results.map((product) => (
                        <ProductCard key={product.id} product={product} closeSearch={closeSearch} router={router} />
                      ))}
                    </div>
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

function ProductCard({ product, closeSearch, router }: { product: Product; closeSearch: () => void; router: any }) {
  return (
    <div
      className="group relative cursor-pointer rounded-2xl border border-white/40 bg-white/40 p-3 transition-all hover:bg-white/60 hover:scale-[1.02] hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
      onClick={() => {
        closeSearch();
        router.push(`/store/product/${product.id}`);
      }}
      role="button"
      tabIndex={0}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200" />
        )}
        {product.isAiRecommended && (
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
  );
}

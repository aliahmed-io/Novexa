"use client";

import { Search } from "lucide-react";
import { useSearch } from "./SearchContext";

export function NavbarSearchTrigger() {
  const { openSearch } = useSearch();

  return (
    <button
      type="button"
      onClick={openSearch}
      className="group flex flex-row-reverse items-center gap-x-2 rounded-md bg-gray-100/80 px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-200/80 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-50"
    >
      <span className="hidden font-medium md:inline-block">Search</span>
      <Search className="h-4 w-4" />
    </button>
  );
}

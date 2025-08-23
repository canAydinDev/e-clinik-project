// src/modules/ui/components/search-filter/search-input.tsx
"use client";

import { SearchIcon, X } from "lucide-react";
import { useCallback } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading?: boolean;
};

export const SearchInput = ({ value, onChange, onSubmit, loading }: Props) => {
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit();
    },
    [onSubmit]
  );

  return (
    <form className="flex w-full max-w-[600px] mb-3" onSubmit={handleSubmit}>
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder="Hasta adı, e-posta, telefon, TCKN…"
          className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            aria-label="Temizle"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 bg-gray-100 border border-l-0 rounded-r-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Ara"
      >
        <SearchIcon className="size-5" />
      </button>
    </form>
  );
};

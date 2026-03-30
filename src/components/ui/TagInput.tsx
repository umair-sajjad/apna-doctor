"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { X, ChevronRight } from "lucide-react";
import { searchDiseases } from "@/lib/diseases";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  allowNone?: boolean;
}

export default function TagInput({
  value,
  onChange,
  placeholder = "Type to search…",
  allowNone = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue.trim().length >= 2) {
      const filtered = searchDiseases(inputValue).filter(
        (s) => !value.includes(s)
      );
      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
      setHighlightedIndex(0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [inputValue, value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      )
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (dropdownRef.current) {
      const el = dropdownRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      );
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !value.includes(t)) {
      onChange([...value.filter((v) => v !== "None"), t]);
      setInputValue("");
      setShowDropdown(false);
      setSuggestions([]);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tag: string) => onChange(value.filter((v) => v !== tag));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((p) => Math.min(p + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showDropdown && suggestions[highlightedIndex])
        addTag(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") setShowDropdown(false);
    else if (e.key === "Backspace" && !inputValue && value.length > 0)
      removeTag(value[value.length - 1]);
  };

  const toggleNone = () =>
    value.includes("None") ? onChange([]) : onChange(["None"]);

  return (
    <div className="relative">
      {/* Input box */}
      <div
        className="min-h-[46px] w-full rounded-xl border p-2 transition"
        style={{ borderColor: "var(--primary-light)", background: "white" }}
      >
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
              style={
                tag === "None"
                  ? { background: "#f3f4f6", color: "#6b7280" }
                  : {
                      background: "var(--primary-light)",
                      color: "var(--primary)",
                    }
              }
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:opacity-70 focus:outline-none"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue.trim().length >= 2 && suggestions.length > 0)
                setShowDropdown(true);
            }}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={value.includes("None")}
            className="min-w-[140px] flex-1 border-none bg-transparent px-1 text-sm outline-none disabled:cursor-not-allowed"
            style={{ color: "var(--text-dark)" }}
          />
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-2xl bg-white shadow-xl"
          style={{ border: "1px solid var(--primary-light)" }}
        >
          {suggestions.map((s, i) => (
            <button
              key={s}
              type="button"
              data-index={i}
              onClick={() => addTag(s)}
              onMouseEnter={() => setHighlightedIndex(i)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors"
              style={
                i === highlightedIndex
                  ? {
                      background: "var(--primary-light)",
                      color: "var(--primary)",
                    }
                  : { color: "var(--text-dark)" }
              }
            >
              <ChevronRight
                size={13}
                style={{ color: "var(--accent)", flexShrink: 0 }}
              />
              <span className="flex-1">{s}</span>
              {i === highlightedIndex && (
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: "var(--primary)" }}
                >
                  Enter
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Helper */}
      <p className="mt-1 text-xs text-gray-400">
        Type at least 2 characters to search. Use ↑↓ to navigate, Enter to
        select.
      </p>

      {/* None toggle */}
      {allowNone && (
        <button
          type="button"
          onClick={toggleNone}
          className="mt-2 flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all"
          style={
            value.includes("None")
              ? {
                  background: "#f3f4f6",
                  borderColor: "#d1d5db",
                  color: "#6b7280",
                }
              : {
                  background: "white",
                  borderColor: "var(--primary-light)",
                  color: "var(--text-dark)",
                }
          }
        >
          <input
            type="checkbox"
            checked={value.includes("None")}
            onChange={toggleNone}
            className="rounded border-gray-300"
            style={{ accentColor: "var(--primary)" }}
          />
          I don't have any chronic diseases
        </button>
      )}
    </div>
  );
}

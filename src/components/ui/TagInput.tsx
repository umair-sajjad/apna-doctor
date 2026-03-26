"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { X, ChevronDown } from "lucide-react";
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
  placeholder = "Type to search...",
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
      const results = searchDiseases(inputValue);
      // Filter out already selected tags
      const filtered = results.filter((s) => !value.includes(s));
      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
      setHighlightedIndex(0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [inputValue, value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      // Remove "None" if adding a disease
      const newTags = value.filter((t) => t !== "None");
      onChange([...newTags, trimmedTag]);
      setInputValue("");
      setShowDropdown(false);
      setSuggestions([]);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showDropdown && suggestions.length > 0) {
        addTag(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    addTag(suggestion);
  };

  const toggleNone = () => {
    if (value.includes("None")) {
      onChange([]);
    } else {
      onChange(["None"]);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (dropdownRef.current) {
      const highlighted = dropdownRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      );
      if (highlighted) {
        highlighted.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="relative">
      <div className="min-h-[42px] w-full rounded-lg border border-gray-300 bg-white p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                tag === "None"
                  ? "bg-gray-200 text-gray-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-blue-900 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <div className="relative min-w-[150px] flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (inputValue.trim().length >= 2 && suggestions.length > 0) {
                  setShowDropdown(true);
                }
              }}
              placeholder={value.length === 0 ? placeholder : ""}
              disabled={value.includes("None")}
              className="w-full border-none bg-transparent px-1 text-sm outline-none disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              data-index={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                index === highlightedIndex
                  ? "bg-blue-50 text-blue-900"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-blue-600" />
              <span className="flex-1">{suggestion}</span>
              {index === highlightedIndex && (
                <span className="text-xs text-blue-600">Press Enter</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Helper Text */}
      <p className="mt-1 text-xs text-gray-500">
        Type at least 2 characters to search. Use ↑↓ arrows to navigate, Enter
        to select
      </p>

      {/* None Option */}
      {allowNone && (
        <button
          type="button"
          onClick={toggleNone}
          className={`mt-2 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            value.includes("None")
              ? "border-gray-400 bg-gray-100 text-gray-700"
              : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <input
            type="checkbox"
            checked={value.includes("None")}
            onChange={toggleNone}
            className="rounded border-gray-300"
          />
          I don't have any chronic diseases
        </button>
      )}
    </div>
  );
}

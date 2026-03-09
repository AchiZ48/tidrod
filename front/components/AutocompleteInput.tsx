'use client';

import { useState, useEffect, useRef } from 'react';

interface Suggestion {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export type SpecialOption = 'CURRENT_LOCATION' | 'MAP_SELECT';

interface AutocompleteInputProps {
  label: string;
  placeholder: string;
  onSelect: (lat: number | null, lon: number | null, displayName: string, specialOption?: SpecialOption) => void;
  className?: string;
  enableCurrentLocation?: boolean;
  enableMapSelect?: boolean;
  value?: string; // Controlled value support
}

export default function AutocompleteInput({ 
  label, 
  placeholder, 
  onSelect, 
  className = '', 
  enableCurrentLocation = false, 
  enableMapSelect = false,
  value
}: AutocompleteInputProps) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (suggestion: Suggestion) => {
    setQuery(suggestion.display_name);
    setShowSuggestions(false);
    onSelect(parseFloat(suggestion.lat), parseFloat(suggestion.lon), suggestion.display_name);
  };

  const handleSpecialSelect = (type: SpecialOption) => {
    setShowSuggestions(false);
    if (type === 'CURRENT_LOCATION') {
      onSelect(null, null, "Current Location", 'CURRENT_LOCATION');
    } else if (type === 'MAP_SELECT') {
      onSelect(null, null, "Selecting on Map...", 'MAP_SELECT');
    }
  };

  return (
    <div className={`relative mb-4 ${className}`} ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type="text"
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
      />
      {loading && <div className="absolute right-3 top-9 text-xs text-gray-400">Loading...</div>}
      
      {showSuggestions && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Special Options */}
          {enableCurrentLocation && (
            <li 
              className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2"
              onClick={() => handleSpecialSelect('CURRENT_LOCATION')}
            >
              📍 Use Current Location
            </li>
          )}
          {enableMapSelect && (
            <li 
              className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2 border-b border-gray-100 dark:border-gray-700"
              onClick={() => handleSpecialSelect('MAP_SELECT')}
            >
              🗺️ Select on Map
            </li>
          )}

          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-200"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

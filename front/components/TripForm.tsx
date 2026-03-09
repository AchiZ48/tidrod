'use client';

import { useState, useMemo, useEffect } from 'react';

interface TripData {
  destination: string;
  date: string;
  timeOption: 'flexible' | 'specific';
  specificTime: string;
  lat: number | null;
  lon: number | null;
  locationName: string;
  privacy: 'open' | 'private';
}

interface TripFormProps {
  onLocationSelectRequest: () => void;
  onLocationSearch: (lat: number, lon: number, name: string) => void;
  onAddTrip: (trip: TripData) => void;
  selectedLocationName?: string;
  selectedLat?: number | null;
  selectedLon?: number | null;
}

export default function TripForm({
  onLocationSelectRequest,
  onLocationSearch,
  onAddTrip,
  selectedLocationName,
  selectedLat,
  selectedLon,
}: TripFormProps) {
  const [step, setStep] = useState(1);

  // Step 1
  const [destination, setDestination] = useState('');
  // Step 2
  const [selectedDate, setSelectedDate] = useState('');
  const [timeOption, setTimeOption] = useState<'flexible' | 'specific'>('flexible');
  const [specificTime, setSpecificTime] = useState('12:00');
  // Step 3
  const [locationName, setLocationName] = useState('');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLon, setLocationLon] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Step 4
  const [privacy, setPrivacy] = useState<'open' | 'private'>('open');

  // Sync external location from map selection
  useEffect(() => {
    if (selectedLocationName && selectedLat != null && selectedLon != null) {
      setLocationName(selectedLocationName);
      setLocationLat(selectedLat);
      setLocationLon(selectedLon);
    }
  }, [selectedLocationName, selectedLat, selectedLon]);

  // Generate next 7 days
  const next7Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push({
        date: d.toISOString().split('T')[0],
        day: d.getDate(),
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  // Search location via Nominatim
  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      setSearchResults(data.slice(0, 5));
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSelect = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setLocationName(result.display_name);
    setLocationLat(lat);
    setLocationLon(lon);
    setSearchResults([]);
    setSearchQuery('');
    onLocationSearch(lat, lon, result.display_name);
  };

  const handleSetLocation = () => {
    if (locationLat != null && locationLon != null) {
      setStep(4);
    } else {
      // Request map pin if no location selected yet
      onLocationSelectRequest();
    }
  };

  const handleAddToMap = () => {
    if (!destination || !selectedDate) return;
    onAddTrip({
      destination,
      date: selectedDate,
      timeOption,
      specificTime: timeOption === 'specific' ? specificTime : '',
      lat: locationLat,
      lon: locationLon,
      locationName,
      privacy,
    });
    // Reset form
    setStep(1);
    setDestination('');
    setSelectedDate('');
    setTimeOption('flexible');
    setSpecificTime('12:00');
    setLocationName('');
    setLocationLat(null);
    setLocationLon(null);
    setPrivacy('open');
  };

  const canGoNext = () => {
    switch (step) {
      case 1: return destination.trim().length > 0;
      case 2: return selectedDate !== '';
      case 3: return locationLat != null && locationLon != null;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Step Indicator */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                s === step
                  ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-300 dark:shadow-blue-900'
                  : s < step
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}
            >
              {s < step ? '✓' : s}
            </div>
            {s < 4 && (
              <div
                className={`flex-1 h-1 mx-1 rounded-full transition-all duration-300 ${
                  s < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="px-6 pb-6">
        {/* ─── STEP 1: Destination ─── */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-5">
              <span className="text-3xl mb-2 block">✈️</span>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">I want to go...</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Where are you headed?</p>
            </div>
            <input
              type="text"
              placeholder="location example"
              className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all text-center text-lg"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              autoFocus
            />
            <button
              onClick={() => setStep(2)}
              disabled={!canGoNext()}
              className="w-full mt-5 py-3 rounded-xl font-bold text-white transition-all duration-200 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              Next →
            </button>
          </div>
        )}

        {/* ─── STEP 2: When? ─── */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-5">
              <span className="text-3xl mb-2 block">📅</span>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">When?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pick a day for your trip</p>
            </div>

            {/* Date Buttons */}
            <div className="grid grid-cols-7 gap-1.5 mb-5">
              {next7Days.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-medium transition-all duration-200 border-2 ${
                    selectedDate === d.date
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-md'
                      : 'border-transparent bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-[10px] uppercase opacity-70">{d.weekday}</span>
                  <span className="text-lg font-bold">{d.day}</span>
                  <span className="text-[10px] opacity-60">{d.month}</span>
                  {d.isToday && (
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-0.5" />
                  )}
                </button>
              ))}
            </div>

            {/* Time Option Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTimeOption('flexible')}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border-2 ${
                  timeOption === 'flexible'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-md'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                🕐 Flexible time
              </button>
              <button
                onClick={() => setTimeOption('specific')}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border-2 ${
                  timeOption === 'specific'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-md'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                ⏰ Set specific time
              </button>
            </div>

            {/* Time Picker (conditional) */}
            {timeOption === 'specific' && (
              <div className="mb-4 animate-fade-in">
                <input
                  type="time"
                  value={specificTime}
                  onChange={(e) => setSpecificTime(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 outline-none text-center text-lg"
                />
              </div>
            )}

            {/* Nav Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canGoNext()}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Map Location ─── */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="text-center mb-5">
              <span className="text-3xl mb-2 block">📍</span>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add pin to map</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Search or tap the map to set your meetup point
              </p>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search specific location..."
                  className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium text-sm disabled:opacity-50"
                >
                  {isSearching ? '...' : '🔍'}
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-48 overflow-auto">
                  {searchResults.map((r: any) => (
                    <li
                      key={r.place_id}
                      onClick={() => handleSearchSelect(r)}
                      className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      📍 {r.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Select on Map Button */}
            <button
              onClick={() => onLocationSelectRequest()}
              className="w-full mb-3 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border-2 border-dashed border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40"
            >
              🗺️ Select on Map
            </button>

            {/* Selected Location Display */}
            {locationName && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-800 dark:text-green-300 animate-fade-in">
                ✅ <strong>Selected:</strong> {locationName}
              </div>
            )}

            {/* Nav Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleSetLocation}
                disabled={!canGoNext()}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                Set Location →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: Who can join? ─── */}
        {step === 4 && (
          <div className="animate-fade-in">
            <div className="text-center mb-5">
              <span className="text-3xl mb-2 block">👥</span>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Who can join?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set trip privacy</p>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              {/* Open */}
              <button
                onClick={() => setPrivacy('open')}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  privacy === 'open'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 shadow-md'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <div className="font-bold text-gray-800 dark:text-white">Open</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Anyone can join</div>
                  </div>
                  {privacy === 'open' && (
                    <span className="ml-auto text-blue-500 text-lg">✓</span>
                  )}
                </div>
              </button>

              {/* Private */}
              <button
                onClick={() => setPrivacy('private')}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  privacy === 'private'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 shadow-md'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <div className="font-bold text-gray-800 dark:text-white">Private</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Approval required</div>
                  </div>
                  {privacy === 'private' && (
                    <span className="ml-auto text-blue-500 text-lg">✓</span>
                  )}
                </div>
              </button>
            </div>

            {/* Nav Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleAddToMap}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                📌 Add to map
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

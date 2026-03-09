'use client';

import { useState, useMemo, useEffect } from 'react';
import { createTrip, getToken, getUser } from '@/lib/api';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
  // Photos
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

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
      onLocationSelectRequest();
    }
  };

  // Photo handling
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files].slice(0, 10));
    const newUrls = files.map(f => URL.createObjectURL(f));
    setPhotoPreviewUrls(prev => [...prev, ...newUrls].slice(0, 10));
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
    setPhotoPreviewUrls(prev => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Submit trip to backend
  const handleAddToMap = async () => {
    if (!destination || !selectedDate || locationLat == null || locationLon == null) return;

    const token = getToken();
    if (!token) {
      setSubmitError('Please sign in to create a trip');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const timeLabel = timeOption === 'specific' ? specificTime : 'Flexible';
      const description = `📅 ${selectedDate} ${timeLabel}\n👥 ${privacy === 'open' ? 'Open' : 'Private'}\n📍 ${locationName}`;

      await createTrip(
        {
          title: destination,
          description,
          latitude: locationLat,
          longitude: locationLon,
        },
        photos,
        token
      );

      // Notify parent
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
      setPhotos([]);
      setPhotoPreviewUrls([]);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create trip');
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="bg-white rounded-3xl shadow-lg border border-[#BFC9D1]/20 overflow-hidden">
      {/* Step Indicator */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                s === step
                  ? 'bg-[#FF9B51] text-white scale-110 shadow-lg shadow-[#FF9B51]/30'
                  : s < step
                  ? 'bg-green-500 text-white'
                  : 'bg-[#EAEFEF] text-[#BFC9D1]'
              }`}
            >
              {s < step ? '✓' : s}
            </div>
            {s < 4 && (
              <div
                className={`flex-1 h-1 mx-1 rounded-full transition-all duration-300 ${
                  s < step ? 'bg-green-500' : 'bg-[#EAEFEF]'
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
              <h2 className="text-xl font-bold text-[#25343F]">I want to go...</h2>
              <p className="text-sm text-[#25343F]/50 mt-1">Where are you headed?</p>
            </div>
            <input
              type="text"
              placeholder="e.g. Bangkok, Chiang Mai..."
              className="w-full p-3 border-2 border-[#BFC9D1]/30 rounded-xl bg-[#EAEFEF]/50 text-[#25343F] focus:border-[#FF9B51] focus:ring-2 focus:ring-[#FF9B51]/20 outline-none transition-all text-center text-lg"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              autoFocus
            />
            <button
              onClick={() => setStep(2)}
              disabled={!canGoNext()}
              className="w-full mt-5 py-3 rounded-xl font-bold text-white transition-all duration-200 bg-[#FF9B51] hover:bg-[#e8893f] disabled:bg-[#BFC9D1] disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none"
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
              <h2 className="text-xl font-bold text-[#25343F]">When?</h2>
              <p className="text-sm text-[#25343F]/50 mt-1">Pick a day for your trip</p>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-5">
              {next7Days.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-medium transition-all duration-200 border-2 ${
                    selectedDate === d.date
                      ? 'border-[#FF9B51] bg-[#FF9B51]/10 text-[#FF9B51] shadow-md'
                      : 'border-transparent bg-[#EAEFEF] text-[#25343F]/60 hover:bg-[#BFC9D1]/30'
                  }`}
                >
                  <span className="text-[10px] uppercase opacity-70">{d.weekday}</span>
                  <span className="text-lg font-bold">{d.day}</span>
                  <span className="text-[10px] opacity-60">{d.month}</span>
                  {d.isToday && (
                    <span className="w-1.5 h-1.5 bg-[#FF9B51] rounded-full mt-0.5" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTimeOption('flexible')}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border-2 ${
                  timeOption === 'flexible'
                    ? 'border-[#FF9B51] bg-[#FF9B51]/10 text-[#FF9B51] shadow-md'
                    : 'border-[#BFC9D1]/30 bg-[#EAEFEF]/50 text-[#25343F]/60 hover:border-[#BFC9D1]'
                }`}
              >
                🕐 Flexible time
              </button>
              <button
                onClick={() => setTimeOption('specific')}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border-2 ${
                  timeOption === 'specific'
                    ? 'border-[#FF9B51] bg-[#FF9B51]/10 text-[#FF9B51] shadow-md'
                    : 'border-[#BFC9D1]/30 bg-[#EAEFEF]/50 text-[#25343F]/60 hover:border-[#BFC9D1]'
                }`}
              >
                ⏰ Set specific time
              </button>
            </div>

            {timeOption === 'specific' && (
              <div className="mb-4 animate-fade-in">
                <input
                  type="time"
                  value={specificTime}
                  onChange={(e) => setSpecificTime(e.target.value)}
                  className="w-full p-3 border-2 border-[#BFC9D1]/30 rounded-xl bg-[#EAEFEF]/50 text-[#25343F] focus:border-[#FF9B51] outline-none text-center text-lg"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl font-bold text-[#25343F]/60 bg-[#EAEFEF] hover:bg-[#BFC9D1]/30 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canGoNext()}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-[#FF9B51] hover:bg-[#e8893f] disabled:bg-[#BFC9D1] disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
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
              <h2 className="text-xl font-bold text-[#25343F]">Add pin to map</h2>
              <p className="text-sm text-[#25343F]/50 mt-1">
                Search or tap the map to set your meetup point
              </p>
            </div>

            <div className="relative mb-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search specific location..."
                  className="flex-1 p-3 border-2 border-[#BFC9D1]/30 rounded-xl bg-[#EAEFEF]/50 text-[#25343F] focus:border-[#FF9B51] outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-3 bg-[#FF9B51] text-white rounded-xl hover:bg-[#e8893f] transition-all font-medium text-sm disabled:opacity-50"
                >
                  {isSearching ? '...' : '🔍'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-[#BFC9D1]/30 rounded-xl shadow-xl max-h-48 overflow-auto">
                  {searchResults.map((r: any) => (
                    <li
                      key={r.place_id}
                      onClick={() => handleSearchSelect(r)}
                      className="px-4 py-3 hover:bg-[#FF9B51]/10 cursor-pointer text-sm text-[#25343F] border-b border-[#EAEFEF] last:border-b-0"
                    >
                      📍 {r.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={() => onLocationSelectRequest()}
              className="w-full mb-3 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border-2 border-dashed border-[#FF9B51]/40 text-[#FF9B51] bg-[#FF9B51]/5 hover:bg-[#FF9B51]/10"
            >
              🗺️ Select on Map
            </button>

            {locationName && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 animate-fade-in">
                ✅ <strong>Selected:</strong> {locationName}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl font-bold text-[#25343F]/60 bg-[#EAEFEF] hover:bg-[#BFC9D1]/30 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleSetLocation}
                disabled={!canGoNext()}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-[#FF9B51] hover:bg-[#e8893f] disabled:bg-[#BFC9D1] disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                Set Location →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: Who can join? + Photos ─── */}
        {step === 4 && (
          <div className="animate-fade-in">
            <div className="text-center mb-5">
              <span className="text-3xl mb-2 block">👥</span>
              <h2 className="text-xl font-bold text-[#25343F]">Final details</h2>
              <p className="text-sm text-[#25343F]/50 mt-1">Set privacy & add photos</p>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              <button
                onClick={() => setPrivacy('open')}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  privacy === 'open'
                    ? 'border-[#FF9B51] bg-[#FF9B51]/10 shadow-md'
                    : 'border-[#BFC9D1]/30 bg-[#EAEFEF]/50 hover:border-[#BFC9D1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <div className="font-bold text-[#25343F]">Open</div>
                    <div className="text-xs text-[#25343F]/50">Anyone can join</div>
                  </div>
                  {privacy === 'open' && (
                    <span className="ml-auto text-[#FF9B51] text-lg">✓</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setPrivacy('private')}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  privacy === 'private'
                    ? 'border-[#FF9B51] bg-[#FF9B51]/10 shadow-md'
                    : 'border-[#BFC9D1]/30 bg-[#EAEFEF]/50 hover:border-[#BFC9D1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <div className="font-bold text-[#25343F]">Private</div>
                    <div className="text-xs text-[#25343F]/50">Approval required</div>
                  </div>
                  {privacy === 'private' && (
                    <span className="ml-auto text-[#FF9B51] text-lg">✓</span>
                  )}
                </div>
              </button>
            </div>

            {/* Photo Upload */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#25343F]/40 uppercase tracking-wider mb-2">
                Photos (optional)
              </label>
              <label className="flex items-center justify-center py-3 px-4 border-2 border-dashed border-[#BFC9D1]/40 rounded-xl text-[#25343F]/50 text-sm cursor-pointer hover:border-[#FF9B51]/40 hover:bg-[#FF9B51]/5 transition-all">
                📷 Add photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
              {photoPreviewUrls.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {photoPreviewUrls.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 text-xs rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {submitError}
              </div>
            )}

            {/* Nav Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl font-bold text-[#25343F]/60 bg-[#EAEFEF] hover:bg-[#BFC9D1]/30 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleAddToMap}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#FF9B51] to-[#e8893f] hover:from-[#e8893f] hover:to-[#d47a30] transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? '⏳ Creating...' : '📌 Add to map'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

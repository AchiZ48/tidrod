'use client';
import TripForm from './TripForm';

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

interface SidebarProps {
  onLocationSelectRequest: () => void;
  onLocationSearch: (lat: number, lon: number, name: string) => void;
  onAddTrip: (trip: TripData) => void;
  selectedLocationName?: string;
  selectedLat?: number | null;
  selectedLon?: number | null;
  selectionMode?: boolean;
  onConfirmSelection?: () => void;
  onCancelSelection?: () => void;
}

export default function Sidebar({
  onLocationSelectRequest,
  onLocationSearch,
  onAddTrip,
  selectedLocationName,
  selectedLat,
  selectedLon,
  selectionMode,
  onConfirmSelection,
  onCancelSelection,
}: SidebarProps) {
  if (selectionMode) {
    return (
      <div className="w-full lg:w-96 h-auto bg-white p-6 rounded-2xl shadow-md border border-[#BFC9D1]/30 mb-6 flex flex-col items-center text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-[#FF9B51]/10 rounded-full flex items-center justify-center mb-4 text-3xl">
          📍
        </div>
        <h3 className="text-xl font-bold text-[#25343F] mb-2">
          Choose Location
        </h3>
        <p className="text-[#25343F]/60 mb-6 text-sm">
          Drag the pin on the map to your exact location.
        </p>

        <div className="flex w-full gap-3">
          <button
            onClick={onCancelSelection}
            className="flex-1 py-2.5 px-4 border border-[#BFC9D1] text-[#25343F]/70 rounded-xl hover:bg-[#EAEFEF] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmSelection}
            className="flex-1 py-2.5 px-4 bg-[#FF9B51] text-white rounded-xl hover:bg-[#e8893f] shadow-lg hover:shadow-xl font-bold transition-all"
          >
            Confirm Location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-96 h-full flex flex-col gap-4 overflow-y-auto pr-2">
      <TripForm
        onLocationSelectRequest={onLocationSelectRequest}
        onLocationSearch={onLocationSearch}
        onAddTrip={onAddTrip}
        selectedLocationName={selectedLocationName}
        selectedLat={selectedLat}
        selectedLon={selectedLon}
      />
    </div>
  );
}
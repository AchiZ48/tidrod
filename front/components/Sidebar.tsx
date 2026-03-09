'use client';
import TripForm from './TripForm';
import LobbyBox from './LobbyBox';

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
      <div className="w-full lg:w-96 h-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6 flex flex-col items-center text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4 text-3xl">
          📍
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          Choose Location
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
          Drag the pin on the map to your exact location.
        </p>

        <div className="flex w-full gap-3">
          <button
            onClick={onCancelSelection}
            className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmSelection}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl font-bold transition-all"
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
      <div className="flex-1 min-h-[300px]">
        
      </div>
    </div>
  );
}
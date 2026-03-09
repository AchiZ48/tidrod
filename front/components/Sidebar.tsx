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
  return (
    <div className="w-full lg:w-96 h-full flex flex-col gap-4 overflow-y-auto pr-2">
      <TripForm
        onLocationSelectRequest={onLocationSelectRequest}
        onLocationSearch={onLocationSearch}
        onAddTrip={onAddTrip}
        selectedLocationName={selectedLocationName}
        selectedLat={selectedLat}
        selectedLon={selectedLon}
        selectionMode={selectionMode}
        onConfirmSelection={onConfirmSelection}
        onCancelSelection={onCancelSelection}
      />
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getTrip, getToken, getUser } from '@/lib/api';
import Chat from '@/components/Chat';

const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#EAEFEF] animate-pulse rounded-xl" />,
});

interface TripPhoto {
  id: string;
  image_url: string;
}

interface TripDetail {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
  username: string;
  author_id: string;
  photos: TripPhoto[] | null;
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const user = getUser();

  useEffect(() => {
    async function loadTrip() {
      try {
        const data = await getTrip(params.id as string);
        setTrip(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load trip');
      } finally {
        setLoading(false);
      }
    }
    loadTrip();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#EAEFEF] pt-22">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FF9B51] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#25343F]/60">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#EAEFEF] pt-22">
        <div className="text-center">
          <span className="text-5xl block mb-4">🗺️</span>
          <h2 className="text-xl font-bold text-[#25343F] mb-2">Trip Not Found</h2>
          <p className="text-[#25343F]/60 mb-6">{error || 'This trip does not exist.'}</p>
          <Link
            href="/home"
            className="inline-flex items-center px-6 py-3 bg-[#FF9B51] text-white rounded-xl font-semibold hover:bg-[#e8893f] transition-all shadow-lg"
          >
            ← Back to Map
          </Link>
        </div>
      </div>
    );
  }

  const photos = trip.photos?.filter(Boolean) || [];

  return (
    <main className="flex-1 overflow-y-auto bg-[#EAEFEF] pt-22">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-[#25343F]/70 hover:text-[#FF9B51] transition-colors mb-6 font-medium"
        >
          ← Back to Map
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Trip Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#BFC9D1]/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#25343F]">{trip.title}</h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-[#25343F]/60">
                    <span className="flex items-center gap-1">
                      👤 {trip.username}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      📅 {new Date(trip.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {trip.description && (
                <div className="mt-4 pt-4 border-t border-[#BFC9D1]/20">
                  <h3 className="text-sm font-semibold text-[#25343F]/40 uppercase tracking-wider mb-2">Travel Story</h3>
                  <p className="text-[#25343F]/80 leading-relaxed whitespace-pre-wrap">{trip.description}</p>
                </div>
              )}
            </div>

            {/* Photo Gallery */}
            {photos.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#BFC9D1]/20">
                <h3 className="text-sm font-semibold text-[#25343F]/40 uppercase tracking-wider mb-4">Photos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo.image_url)}
                      className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <img
                        src={photo.image_url}
                        alt="Trip photo"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#BFC9D1]/20">
              <h3 className="text-sm font-semibold text-[#25343F]/40 uppercase tracking-wider px-6 pt-6 mb-4">Location</h3>
              <div className="h-[300px]">
                <MapComponent
                  markers={[{ lat: trip.latitude, lon: trip.longitude, label: trip.title, color: '#FF9B51' }]}
                  center={[trip.longitude, trip.latitude]}
                  zoom={13}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Chat */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Chat tripId={trip.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-2xl font-bold"
            >
              ✕
            </button>
            <img
              src={selectedPhoto}
              alt="Trip photo"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </main>
  );
}

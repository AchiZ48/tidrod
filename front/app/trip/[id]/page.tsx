'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getTrip, getToken, getUser, deleteTrip } from '@/lib/api';
import Chat from '@/components/Chat';
import { SkeletonTripDetail } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';

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
  const [hasJoined, setHasJoined] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = getUser();
  const { addToast } = useToast();

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
      <main className="flex-1 bg-[#EAEFEF] overflow-y-auto">
        <SkeletonTripDetail />
      </main>
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

  const handleDeleteTrip = async () => {
    if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    const token = getToken();
    if (!token) {
      addToast('You must be logged in to delete a trip', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTrip(trip.id, token);
      addToast('Trip deleted successfully', 'success');
      router.push('/home');
    } catch (err: any) {
      addToast(err.message || 'Failed to delete trip', 'error');
      setIsDeleting(false);
    }
  };

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

                {/* Delete Button (Only for Author) */}
                {user?.id === trip.author_id && (
                  <button
                    onClick={handleDeleteTrip}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-100 disabled:opacity-50"
                  >
                    🗑️ {isDeleting ? 'Deleting...' : 'Delete Trip'}
                  </button>
                )}
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
              {hasJoined ? (
                <Chat tripId={trip.id} onLeave={() => setHasJoined(false)} />
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#BFC9D1]/20">
                  <div className="w-16 h-16 bg-[#FF9B51]/10 text-[#FF9B51] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    💬
                  </div>
                  <h3 className="font-bold text-[#25343F] text-lg mb-2">Trip Discussion</h3>
                  <p className="text-sm text-[#25343F]/60 mb-6 leading-relaxed">
                    Join the chat to talk with the author and other travelers about this trip.
                  </p>
                  <button
                    onClick={() => {
                      if (!user) {
                        addToast('Please login to join the chat', 'error');
                        return;
                      }
                      setHasJoined(true);
                    }}
                    className="w-full py-3 px-4 bg-[#FF9B51] hover:bg-[#e8893f] text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    Join Trip Chat
                  </button>
                </div>
              )}
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

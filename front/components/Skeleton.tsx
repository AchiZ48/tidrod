'use client';

export function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[#BFC9D1]/20 animate-pulse rounded-xl ${className}`} />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3.5 bg-[#BFC9D1]/20 animate-pulse rounded-lg"
          style={{ width: i === lines - 1 ? '60%' : `${85 + ((i * 7) % 15)}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-[#BFC9D1]/20 ${className}`}>
      <SkeletonBox className="h-5 w-1/3 mb-4" />
      <SkeletonText lines={3} />
      <div className="flex gap-3 mt-4">
        <SkeletonBox className="h-10 flex-1" />
        <SkeletonBox className="h-10 flex-1" />
      </div>
    </div>
  );
}

export function SkeletonTripDetail() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pt-22">
      <SkeletonBox className="h-4 w-32 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#BFC9D1]/20">
            <SkeletonBox className="h-8 w-2/3 mb-3" />
            <SkeletonBox className="h-4 w-1/3 mb-6" />
            <SkeletonText lines={4} />
          </div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#BFC9D1]/20">
            <SkeletonBox className="h-[300px] rounded-none" />
          </div>
        </div>
        <div className="lg:col-span-1">
          <SkeletonCard className="h-[400px]" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pt-22">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#BFC9D1]/20">
        <div className="flex items-center gap-6 mb-8">
          <SkeletonBox className="w-20 h-20 rounded-full" />
          <div className="flex-1">
            <SkeletonBox className="h-7 w-1/3 mb-2" />
            <SkeletonBox className="h-4 w-1/4" />
          </div>
        </div>
        <SkeletonBox className="h-5 w-24 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="h-48" />
          ))}
        </div>
      </div>
    </div>
  );
}

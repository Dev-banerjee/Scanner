export function HistorySkeleton() {
    return (
        <div className="flex-1 rounded-[12px] md:rounded-[20px] lg:rounded-[24px] bg-[#0A0A0A]/50 relative overflow-hidden p-3 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8">
            {/* Header Skeleton */}
            <div className="flex justify-between items-start animate-pulse">
                <div className="space-y-3">
                    <div className="h-8 md:h-10 w-48 md:w-64 bg-white/10 rounded-xl" />
                    <div className="h-4 w-32 bg-white/5 rounded-lg" />
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-24 bg-white/10 rounded-xl" />
                    <div className="h-10 w-32 bg-white/10 rounded-xl" />
                </div>
            </div>

            {/* Cards Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 md:h-32 bg-white/5 rounded-xl md:rounded-[24px] border border-white/5" />
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6 animate-pulse">
                <div className="lg:col-span-2 h-64 bg-white/5 rounded-2xl md:rounded-[32px] border border-white/5" />
                <div className="h-64 bg-white/5 rounded-2xl md:rounded-[32px] border border-white/5" />
            </div>

            {/* List Skeleton */}
            <div className="flex-1 bg-white/5 rounded-2xl md:rounded-[32px] border border-white/5 p-6 space-y-4 animate-pulse">
                <div className="h-6 w-48 bg-white/10 rounded-lg mb-6" />
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 w-full bg-white/5 rounded-xl" />
                ))}
            </div>
        </div>
    );
}

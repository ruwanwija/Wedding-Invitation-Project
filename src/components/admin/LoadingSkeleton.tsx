export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-zinc-950 p-8 animate-pulse">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 h-96 bg-white dark:bg-zinc-900 rounded-3xl" />
        <div className="lg:col-span-9 h-[600px] bg-white dark:bg-zinc-900 rounded-[35px]" />
      </div>
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-100 dark:bg-zinc-800 rounded-lg w-1/3" />
      <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded w-1/2" />
      <div className="grid grid-cols-2 gap-4 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-zinc-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

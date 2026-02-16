export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-cdi-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    </div>
  );
}

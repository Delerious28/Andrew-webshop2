export default function Loading() {
  return (
    <div className="w-full min-h-[40vh] flex items-center justify-center">
      <div className="animate-spin h-10 w-10 rounded-full border-2 border-brand border-t-transparent" aria-label="Loading" />
    </div>
  );
}

import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      <div className="h-24" />
      <div className="px-4 pt-30">
        <article className="mx-auto max-w-4xl">
          <Skeleton className="mb-6 h-10 w-3/4 bg-white/10" />
          <Skeleton className="mb-10 h-96 w-full rounded bg-white/10" />
          <Skeleton className="mb-10 h-5 w-40 bg-white/10" />
          <Skeleton className="mb-3 h-4 w-full bg-white/10" />
          <Skeleton className="mb-3 h-4 w-full bg-white/10" />
          <Skeleton className="mb-3 h-4 w-11/12 bg-white/10" />
          <Skeleton className="mb-3 h-4 w-full bg-white/10" />
          <Skeleton className="mb-3 h-4 w-10/12 bg-white/10" />
        </article>
        <div className="h-40 pt-20" />
      </div>
    </div>
  );
}

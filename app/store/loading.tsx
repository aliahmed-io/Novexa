import { Skeleton } from "@/components/ui/skeleton";

export default function StoreLoading() {
    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-4">
                        <Skeleton className="aspect-square w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-5 w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

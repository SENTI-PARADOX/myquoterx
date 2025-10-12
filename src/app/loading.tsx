import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
        <div className="relative w-full max-w-sm aspect-[9/16] overflow-hidden rounded-2xl shadow-2xl bg-card border flex flex-col p-6 justify-end">
            <div className="absolute inset-0">
                <Skeleton className="h-full w-full" />
            </div>

            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex flex-col items-center justify-center text-center mb-24">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/4 self-end" />
                </div>
                <div>
                    <div className="grid grid-cols-4 gap-2">
                        <Skeleton className="h-[76px] w-full rounded-lg" />
                        <Skeleton className="h-[76px] w-full rounded-lg" />
                        <Skeleton className="h-[76px] w-full rounded-lg" />
                        <Skeleton className="h-[76px] w-full rounded-lg" />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Skeleton className="h-14 flex-grow" />
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <Skeleton className="h-14 w-14 rounded-full" />
                </div>
            </div>
        </div>
    </div>
  )
}

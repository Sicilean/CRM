"use client";

import { Suspense } from "react";
import { QuotePublicView } from "@/components/features/quote-public-view";
import { Loader2 } from "lucide-react";

interface Props {
  params: { token: string };
}

export default function PublicQuotePage({ params }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 print:bg-white print:from-white print:to-white">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen no-print">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        }
      >
        <QuotePublicView token={params.token} />
      </Suspense>
    </div>
  );
}

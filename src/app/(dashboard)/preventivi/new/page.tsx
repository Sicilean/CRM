"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function NuovoPreventivoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserva i parametri della query string nel redirect
    const queryString = searchParams.toString();
    const redirectUrl = queryString 
      ? `/preventivi/new/edit?${queryString}`
      : "/preventivi/new/edit";
    router.replace(redirectUrl);
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

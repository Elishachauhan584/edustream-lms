"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AutoRefresh() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("success") === "1") {
      router.replace(window.location.pathname);
      window.location.reload();
    }
  }, [searchParams, router]);
  return null;
} 
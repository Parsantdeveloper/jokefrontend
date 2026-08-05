"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axiosInstance";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ok">("checking");

  useEffect(() => {
    let ignore = false;

    api
      .get("/auth/session")
      .then(({ data }) => {
        if (ignore) return;
        if (data.data.role !== "ADMIN") {
          router.replace("/unauthorized");
        } else {
          setStatus("ok");
        }
      })
      .catch(() => {
        if (!ignore) router.replace("/auth/login");
      });

    return () => {
      ignore = true;
    };
  }, [router]);

  if (status === "checking") return null;

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {children}
    </div>
  );
}
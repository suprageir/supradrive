"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-900 dark:text-gray-100">
      <nav className="p-4 bg-black flex justify-between items-center">
        <ol className="flex space-x-2">
          <li className="after:content-['/'] after:px-2 text-green-500">Home</li>
        </ol>
      </nav>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8 p-2">
          <h1 className="text-3xl text-green-500">Home</h1>
        </div>
      </div>
    </div>
  );
}
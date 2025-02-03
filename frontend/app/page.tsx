"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingScreen from "./components/LoadingScreen";

export default function Page() {
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedToken = sessionStorage.getItem("supradrivetoken") || "";

    if (storedToken && storedToken !== "") {
      setToken(storedToken);
      setLoading(false);
    } else {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }
  else {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <nav className="p-4 bg-gray-200 dark:bg-gray-800">
          <ol className="flex space-x-2">
            <li className="after:content-['/'] after:px-2">Home</li>
          </ol>
        </nav>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-8 p-4">
            <h5 className="text-xl font-bold">...s files</h5>
          </div>

          <div className="col-span-12 md:col-span-4 flex justify-end space-x-4 p-4">
            <button className="px-4 py-2 bg-red-500 text-white rounded-sm shadow-sm hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center mt-10">
          <div className="w-full h-96 bg-gray-800 dark:bg-gray-700 rounded-lg shadow-lg p-6 mr-8 ml-8">
            <div className="flex flex-col space-y-4">
              <h5 className="text-xl font-bold text-white">Encrypted Folders</h5>
              <div className="flex items-center space-x-4">
                <Link href="/encrypted/textfiles">
                  <div className="flex flex-col items-center group">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="yellow"
                      width="60"
                      height="60"
                      viewBox="0 0 24 24"
                      className="hi-folder text-yellow-500 group-hover:text-yellow-400 transform group-hover:scale-110 transition duration-300"
                    >
                      <path d="M3 18V6a2 2 0 012-2h4.539a2 2 0 011.562.75L12.2 6.126a1 1 0 00.78.375H20a1 1 0 011 1V18a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
                    </svg>
                    <span className="text-white group-hover:text-gray-300 transition duration-300">
                      Text files
                    </span>
                  </div>
                </Link>
                <Link href="/encrypted-images">
                  <div className="flex flex-col items-center group">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="yellow"
                      width="60"
                      height="60"
                      viewBox="0 0 24 24"
                      className="hi-folder text-yellow-500 group-hover:text-yellow-400 transform group-hover:scale-110 transition duration-300"
                    >
                      <path d="M3 18V6a2 2 0 012-2h4.539a2 2 0 011.562.75L12.2 6.126a1 1 0 00.78.375H20a1 1 0 011 1V18a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
                    </svg>
                    <span className="text-white group-hover:text-gray-300 transition duration-300">
                      Images
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

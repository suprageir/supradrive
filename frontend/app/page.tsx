"use client";

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

const APIURL = process.env.NEXT_PUBLIC_APIURL;

export default function Page() {
  const [loading, setLoading] = useState(true);
  const user = sessionStorage.getItem("supradriveuser") || "";

  useEffect(() => {
    const token = sessionStorage.getItem("supradrivetoken") || "";

    const checkToken = async () => {
      axios.get(APIURL + "/supradrive/auth/token", { withCredentials: true, headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } })
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          redirect('/login');
        });
    };
    checkToken();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-xl font-medium text-gray-300">Checking authentication...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="p-4 bg-gray-200 dark:bg-gray-800">
        <ol className="flex space-x-2">
          <li className="after:content-['/'] after:px-2">Home</li>
        </ol>
      </nav>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8 p-4">
          <h5 className="text-xl font-bold">{user}'s files</h5>
        </div>

        <div className="col-span-12 md:col-span-4 flex justify-end space-x-4 p-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600">Button 1</button>
          <button className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600">Button 2</button>
          <button className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600">Button 3</button>

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
                  <span className="text-white group-hover:text-gray-300 transition duration-300">Text files</span>
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
                  <span className="text-white group-hover:text-gray-300 transition duration-300">Images</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}


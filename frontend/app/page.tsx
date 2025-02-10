"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingScreen from "./components/LoadingScreen";

export default function Page() {
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userid, setUserid] = useState("");
  const router = useRouter();

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    router.push("/login");
  }

  useEffect(() => {
    if (sessionStorage.getItem("supradriveuser") && sessionStorage.getItem("supradriveuserid") && sessionStorage.getItem("supradrivetoken")) {
      setUsername(sessionStorage.getItem("supradriveuser") || "");
      setUserid(sessionStorage.getItem("supradriveuserid") || "");
      setToken(sessionStorage.getItem("supradrivetoken") || "");
      setLoading(false);
    }
    else {
      sessionStorage.clear();
      localStorage.clear();
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <LoadingScreen text="Loading" />;
  }
  if (!loading) {
    return (
      <div className="min-h-screen bg-black text-gray-900 dark:text-gray-100">

        <nav className="p-4 bg-black flex justify-between items-center">
          <ol className="flex space-x-2">
            <Link href="/"><li className="text-green-700">Home</li></Link>
          </ol>
          <button className="px-2 py-1 border border-red-500 text-red-500 text-sm rounded shadow-sm flex items-center gap-1 hover:bg-red-500 hover:text-white transition" onClick={logout}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.293 7.293a1 1 0 011.414 1.414L15.414 11H21a1 1 0 110 2h-5.586l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4z"></path>
              <path d="M10 4a1 1 0 011 1v2a1 1 0 11-2 0V6H7a3 3 0 00-3 3v6a3 3 0 003 3h2v-1a1 1 0 112 0v2a1 1 0 01-1 1H7a5 5 0 01-5-5V9a5 5 0 015-5h2V4a1 1 0 011-1z"></path>
            </svg>
            Logout
          </button>
        </nav>


        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-8 p-2">
            <h1 className="text-3xl text-green-500">{username}&apos;s files</h1>
          </div>

        </div>

        <div className="flex items-center justify-center mt-5">
          <div className="w-full h-96 bg-black rounded-lg shadow-lg p-6 mr-8 ml-2">
            <div className="flex flex-col space-y-4">
              <div className="text-xl text-green-500 flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3h-6zm3 3a2 2 0 110 4 2 2 0 010-4z"></path>
                </svg>
                Encrypted Folders
              </div>

              <div className="flex items-center space-x-10">
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
                    <span className="text-green-500 group-hover:text-white transition duration-300">
                      Text
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
                    <span className="text-green-500 group-hover:text-white transition duration-300">
                      Images
                    </span>
                  </div>
                </Link>
              </div>
  


          <div className="text-xl text-green-500 flex items-center gap-2 mt-5">
            Folders
          </div>

          <div className="flex items-center space-x-10">
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
                <span className="text-green-500 group-hover:text-white transition duration-300">
                  Text
                </span>
              </div>
            </Link>
            <Link href="/images">
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
                <span className="text-green-500 group-hover:text-white transition duration-300">
                  Images
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
        </div >
      </div >
    );
  }
}

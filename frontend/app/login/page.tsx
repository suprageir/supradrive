"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const APIURL = process.env.NEXT_PUBLIC_APIURL;

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter(); // Use Next.js router for navigation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginData = { username, password };

    try {
      const response = await axios.post(
        `${APIURL}/supradrive/auth/login`,
        loginData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        const { username, token, userid } = response.data;

        // Store user data in sessionStorage
        sessionStorage.setItem("supradriveuser", username);
        sessionStorage.setItem("supradrivetoken", token);
        sessionStorage.setItem("supradriveuserid", userid);

        // Redirect to the home page
        router.push("/");
      }
    } catch (error: any) {
      // Handle errors, e.g., invalid credentials
      if (error.response) {
        setErrorMessage(error.response.data.message || "Login failed");
      } else {
        console.error("Error:", error);
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl text-white font-semibold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-white">Username</label>
            <input
              id="username"
              type="text"
              className="w-full p-2 mt-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-white">Password</label>
            <input
              id="password"
              type="password"
              className="w-full p-2 mt-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {errorMessage && (
            <div className="mb-4 text-red-500 text-sm">{errorMessage}</div>
          )}
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
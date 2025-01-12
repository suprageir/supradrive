"use client";

import React, { FC, useState } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';

const APIURL = process.env.NEXT_PUBLIC_APIURL;

const Login: FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

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

        sessionStorage.setItem("supradriveuser", username);
        sessionStorage.setItem("supradrivetoken", token);
        sessionStorage.setItem("supradriveuserid", userid);

        router.push("/");
      }

    } catch (error: any) {
      if (error.response) {
        setErrorMessage(error.response.data.message || "Login failed");
      } else {
        console.error("Error:", error);
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6">SupraDrive login</h2>
        <form>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your username"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your password"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>

          <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-4">
            Don't have an account?
            <a href="/signup" className="text-blue-500 hover:underline ml-1">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
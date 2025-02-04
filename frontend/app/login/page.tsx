"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
const APIURL = process.env.NEXT_PUBLIC_APIURL;


const Login = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string>("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (input.trim() === "") {
        setError("Please enter a username.");
        return;
      }
      setUsername(input);
      setError(null);
      setStep(2);
      setOutput((prev) => prev + "\n" + "> " + input);
      setInput("");
    } else if (step === 2) {
      if (input.trim() === "") {
        setError("Please enter a password.");
        return;
      }
      setPassword(input);
      setError(null);
      setOutput((prev) => prev + "\n" + "> " + "*".repeat(input.length));
      setInput("");
    }
  };

  const checkLogin = async () => {
    try {
      setChecking("Verifying login credentials, please wait...");
      const loginData = { username, password };
      const response = await axios.post(`${APIURL}/supradrive/auth/login`, loginData, { headers: { "Content-Type": "application/json" } });
      if (response.status === 200) {
        console.log(response.data);
        sessionStorage.setItem("supradriveuser", response.data.username);
        sessionStorage.setItem("supradrivetoken", response.data.token);
        sessionStorage.setItem("supradriveuserid", response.data.userid);

        router.push("/");
      }

    } catch (error: any) {
      if (error.response) {
        setError("Invalid credentials!");
      } else {
        console.error("Error:", error);
        setError("An unexpected error occurred.");
      }
    }
    setChecking(null);
  };

  useEffect(() => {
    if (step === 1) {
      setOutput("Enter your username: ");
    } else if (step === 2) {
      setOutput((prev) => prev + "\nEnter your password: ");
    }
  }, [step]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (password.length > 0) {
      checkLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono flex justify-center sm:items-start sm:px-4">
      <div className="w-[600px] p-6 border border-green-500 border-2 rounded-md shadow-lg sm:w-full sm:max-w-md sm:mt-50">
        <h1 className="text-3xl text-green-500 text-center mb-6">SupraDrive login</h1>
        <div
          ref={outputRef}
          className="h-72 overflow-y-auto bg-black p-4 border border-green-900 rounded-md"
        >
          <pre className="whitespace-pre-wrap">{output}</pre>
          {error && <p className="text-red-500">{error}</p>}
          {checking && <p className="text-green-500">{checking}</p>}
        </div>
  
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex items-center">
            <div className="relative w-full">
              <input
                type={step === 2 ? "password" : "text"}
                className="bg-black text-green-500 border border-green-500 p-2 pl-6 w-full focus:outline-none"
                placeholder={step === 1 ? "Username" : "Password"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-green-500">{">"}</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
  
};

export default Login;
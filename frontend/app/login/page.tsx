"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import LoadingScreen from "../components/LoadingScreen";
import { motion } from "framer-motion";

const APIURL = process.env.NEXT_PUBLIC_APIURL;

const Login = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [input, setInput] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);
    const [loginfail, setLoginfail] = useState(false);
    const outputRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() === "") {
            setError(step === 1 ? "Please enter a username." : "Please enter a password.");
            return;
        }

        setError(null);

        if (step === 1) {
            setUsername(input);
            setStep(2);
            setInput("");
        } else {
            setPassword(input);
            setStep(3); // Move to next phase (login verification)
            setInput("");
        }
    };

    const checkLogin = async () => {
        try {
            setChecking(true);
            const response = await axios.post(`${APIURL}/supradrive/auth/login`, { username, password });

            if (response.status === 200) {
                document.cookie = `token=${response.data.token}; Secure; SameSite=Strict; Path=/`;
                sessionStorage.setItem("supradrivetoken", response.data.token);
                sessionStorage.setItem("supradriveuser", response.data.username);
                sessionStorage.setItem("supradriveuserid", response.data.userid);
                router.push("/");
            }
        } catch (error) {
            setLoginfail(true);
            setChecking(false);
            console.log(error);
        }
    };

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [username, password]);

    useEffect(() => {
        if (step === 3 && username.length > 0 && password.length > 0) {
            checkLogin();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    useEffect(() => {
        if (loginfail) {
            const timer = setTimeout(() => {
                setLoginfail(false);
                setStep(1);
                setUsername("");
                setPassword("");
                setInput("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [loginfail]);

    if (checking) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black">
                <LoadingScreen text="Checking credentials" />
            </div>
        );
    }
    if (loginfail) {
        return (
            <div className="flex justify-center items-center h-screen bg-black">
                <motion.div
                    className="relative flex flex-col items-center"
                >
                    <motion.span
                        className="text-red-700 mt-4 text-lg font-semibold flex"
                    >
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32">
                                <circle cx="32" cy="32" r="30" fill="#FF0000" />
                                <line x1="16" y1="16" x2="48" y2="48" stroke="#ffffff" />
                                <line x1="48" y1="16" x2="16" y2="48" stroke="#ffffff" />
                            </svg>
                            Login failed
                        </div>
                    </motion.span>
                </motion.div>
            </div>
        );
    }
    return (
        <div className="text-green-500 font-mono flex justify-center sm:items-start sm:px-4">
            <div className="w-[600px] p-6 sm:w-full sm:max-w-lg sm:mt-50 xs:mt-0">
                <h1 className="text-3xl text-green-500 text-center mb-6">SupraDrive Login</h1>
                <div ref={outputRef} className="h-72 overflow-y-auto bg-black p-4">

                    {/* Display Entered Username */}
                    {username && (
                        <p className="text-green-500">
                            <span>Username:</span> {username}
                        </p>
                    )}

                    {/* Username Input */}
                    {step === 1 && (
                        <div className="flex items-center">
                            <span className="text-green-500 mr-2">Username:</span>
                            <form onSubmit={handleSubmit} className="inline-block">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="bg-transparent text-green-500 border-none outline-none p-0 w-auto inline-block"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    autoFocus
                                />
                            </form>
                        </div>
                    )}

                    {/* Display Entered Password */}
                    {password && (
                        <p className="text-green-500">
                            <span>Password:</span> {"•".repeat(password.length)}
                        </p>
                    )}

                    {/* Password Input */}
                    {step === 2 && (
                        <div className="mt-2 flex items-center">
                            <span className="text-green-500 mr-2">Password:</span>
                            <form onSubmit={handleSubmit} className="inline-block">
                                <input
                                    ref={inputRef}
                                    type="password"
                                    className="bg-transparent text-green-500 border-none outline-none p-0 w-auto inline-block"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    autoFocus
                                />
                            </form>
                        </div>
                    )}

                    {/* Login Verification */}
                    {checking && <p className="text-green-500 mt-2">{checking}</p>}
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default Login;

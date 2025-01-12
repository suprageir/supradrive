"use client";
import { useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import axios from 'axios';
import Link from "next/link";

const APIURL = process.env.NEXT_PUBLIC_APIURL;

interface EncryptedResult {
    iv: number[];
    salt: number[];
    encryptedText: string;
}

export default function Page() {
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalEncryptionOpen, setIsModalEncryptionOpen] = useState(false);
    const [fileName, setFileName] = useState("Untitled.txt");
    const [fileContent, setFileContent] = useState("");
    const [encryptedContent, setEncryptedContent] = useState("");
    const [encryptionKey, setEncryptionKey] = useState("");
    const [activeTab, setActiveTab] = useState<"plaintext" | "encrypted">(
        "plaintext"
    );
    const [iv, setIv] = useState<number[]>([]);
    const [salt, setSalt] = useState<number[]>([]);
    const user = sessionStorage.getItem("supradriveusername") || "";


    const saveFile = () => {
        // Create the content to save
        const fileData = {
            fileName: fileName,
            iv: iv,
            salt: salt,
            content: encryptedContent || "No encryption key set",
        };

        // Convert the file data to a Blob (for downloading)
        const blob = new Blob([JSON.stringify(fileData, null, 2)], {
            type: "application/json",
        });

        // Create a link element to trigger the download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.json`; // Save as .json file
        link.click();
    };


    const getEncryptionPassword = () => {
        const cookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("encryptionPassword="));
        return cookie ? decodeURIComponent(cookie.split("=")[1]) : "";
    };

    const setCookiePassword = () => {
        document.cookie = `encryptionPassword=${encryptionKey}; Secure; SameSite=Strict; Path=/`;
        alert("Encryption key has been set successfully!");
        setIsModalEncryptionOpen(false);
    };

    const encryptText = async (text: string, key: string): Promise<EncryptedResult | string> => {
        if (!key) return ""; // Return an empty string if no key is provided
        const encoder = new TextEncoder();
        const passwordKey = await window.crypto.subtle.importKey(
            "raw",
            encoder.encode(key),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        setSalt(Array.from(salt)); // Store salt in state

        const encryptionKey = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt,
                iterations: 100000,
                hash: "SHA-256",
            },
            passwordKey,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt"]
        );

        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        setIv(Array.from(iv)); // Store IV in state

        const encryptedData = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            encryptionKey,
            encoder.encode(text)
        );

        return {
            iv: Array.from(iv),
            salt: Array.from(salt),
            encryptedText: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
        };
    };

    const handleFileContentChange = async (text: string) => {
        setFileContent(text);

        const password = getEncryptionPassword();
        if (password) {
            const result = await encryptText(text, password);
            if (typeof result !== "string") {
                setEncryptedContent(result.encryptedText);
            } else {
                setEncryptedContent("");
            }
        } else {
            alert("Encryption password is not set.");
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const openModalEncryption = () => setIsModalEncryptionOpen(true);
    const closeModalEncryption = () => setIsModalEncryptionOpen(false);


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
        <>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <nav className="p-4 bg-gray-200 dark:bg-gray-800">
                    <ol className="flex space-x-2">
                        <Link href="/"><li className="after:content-['/'] after:px-2">Home</li></Link>
                        <li className="after:content-['/'] after:px-2">Encrypted</li>
                        <li className="after:content-['/'] after:px-2">Text files</li>
                    </ol>
                </nav>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-8 p-4">
                        <h5 className="text-xl font-bold">Encrypted Text files</h5>
                    </div>

                    <div className="col-span-12 md:col-span-4 flex justify-end space-x-4 p-4">
                        <button className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600">Button 1</button>
                        <button className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600">Button 2</button>
                        <button className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600">Button 3</button>

                    </div>

                </div>


                <div className="mx-auto space-y-8 px-2 pt-20 lg:px-8 lg:py-8">
                    <div className="rounded-lg bg-vc-border-gradient p-px shadow-lg shadow-black/20">
                        <div className="rounded-lg bg-black">

                        </div>
                    </div>

                    <div className="rounded-lg bg-vc-border-gradient p-px shadow-lg shadow-black/20">
                        <div className="rounded-lg bg-black p-3.5 lg:p-6 w-full">


                            <div className="prose prose-sm prose-invert max-w-none">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold">Encrypted Textfiles</h3>
                                    <div className="flex gap-4">
                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
                                            Create New Folder
                                        </button>
                                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500">
                                            Upload New Text File
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                                            onClick={openModal}
                                        >
                                            Create New Text File
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                                            onClick={openModalEncryption}
                                        >
                                            Set Encryption Password
                                        </button>
                                    </div>
                                </div>

                                {/* Modal for Creating a New File */}
                                {isModalOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                        <div className="w-full max-w-3xl bg-gray-800 text-white rounded-lg shadow-lg p-4">
                                            {/* Modal Header */}
                                            <div className="flex flex-col mb-4 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <input
                                                        type="text"
                                                        value={fileName}
                                                        onChange={(e) => setFileName(e.target.value)}
                                                        className="px-2 py-1 text-lg bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Enter file name"
                                                    />
                                                </div>
                                                <div className="flex flex-col space-y-1 mt-2">
                                                    <span className="text-sm">IV:</span>
                                                    <span className="text-sm">{iv.length ? iv.join(', ') : 'Not generated'}</span>
                                                </div>
                                                <div className="flex flex-col space-y-1 mt-2">
                                                    <span className="text-sm">Salt:</span>
                                                    <span className="text-sm">{salt.length ? salt.join(', ') : 'Not generated'}</span>
                                                </div>
                                            </div>

                                            {/* Tabs for Plain Text and Encrypted Content */}
                                            <div className="mb-4">
                                                <button
                                                    className={`px-4 py-2 rounded-t-lg ${activeTab === "plaintext" ? "bg-gray-700 text-white" : "bg-gray-600 text-gray-300"}`}
                                                    onClick={() => setActiveTab("plaintext")}
                                                >
                                                    Plain Text
                                                </button>
                                                <button
                                                    className={`px-4 py-2 rounded-t-lg ${activeTab === "encrypted" ? "bg-gray-700 text-white" : "bg-gray-600 text-gray-300"}`}
                                                    onClick={() => setActiveTab("encrypted")}
                                                >
                                                    Encrypted Text
                                                </button>
                                            </div>

                                            {/* Tab Content */}
                                            <div className="bg-gray-700 p-4 rounded-lg">
                                                {activeTab === "plaintext" && (
                                                    <textarea
                                                        className="w-full h-64 p-2 bg-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                                                        value={fileContent}
                                                        onChange={(e) => handleFileContentChange(e.target.value)}
                                                        placeholder="Write your text here..."
                                                    ></textarea>
                                                )}
                                                {activeTab === "encrypted" && (
                                                    <p className="break-words text-sm">
                                                        {encryptedContent || "Encrypted content will appear here."}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Modal Footer */}
                                            <div className="flex justify-end mt-4">
                                                <button
                                                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 mr-2 inline-flex items-center gap-2"
                                                    onClick={closeModal}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Close
                                                </button>
                                                <button
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-2 inline-flex items-center gap-2 focus:ring-2 focus:ring-green-500"
                                                    onClick={() => {
                                                        console.log("Filename:", fileName);
                                                        console.log("Original Content:", fileContent);
                                                        console.log("Encrypted Content:", encryptedContent);
                                                        console.log("IV:", iv);
                                                        console.log("Salt:", salt);
                                                        saveFile();
                                                        closeModal();
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                    </svg>
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Modal for Setting Encryption Password */}
                                {isModalEncryptionOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                        <div className="w-full max-w-md bg-gray-800 text-white rounded-lg shadow-lg p-6">
                                            <h4 className="text-lg font-bold mb-4">Set Encryption Password</h4>
                                            <input
                                                type="password"
                                                value={encryptionKey}
                                                onChange={(e) => setEncryptionKey(e.target.value)}
                                                className="w-full px-4 py-2 text-lg bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter your password"
                                            />
                                            <div className="flex justify-end gap-4 mt-4">
                                                <button
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                                                    onClick={closeModalEncryption}
                                                >
                                                    Close
                                                </button>
                                                <button
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                                                    onClick={setCookiePassword}
                                                >
                                                    Activate
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                </div>
            </div>

        </>
    );
}

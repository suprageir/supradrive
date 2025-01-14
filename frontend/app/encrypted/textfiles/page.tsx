"use client";

import { useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import axios from 'axios';
import Link from "next/link";
import { Encrypt } from "@/app/components/Encrypt";
import { Decrypt } from "@/app/components/Decrypt";

const APIURL = process.env.NEXT_PUBLIC_APIURL;

export default function Page() {
    const [token, setToken] = useState(sessionStorage.getItem("supradrivetoken") || "");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalEncryptionOpen, setIsModalEncryptionOpen] = useState(false);
    const [isModalNewFolderOpen, setIsModalNewFolderOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [fileName, setFileName] = useState("Untitled.txt");
    const [fileContent, setFileContent] = useState("");
    const [encryptedContent, setEncryptedContent] = useState("");
    const [encryptionKey, setEncryptionKey] = useState("");
    const [newKey, setNewKey] = useState("");
    const [activeTab, setActiveTab] = useState<"plaintext" | "encrypted">(
        "plaintext"
    );
    const [iv, setIv] = useState<number[]>([]);
    const [salt, setSalt] = useState<number[]>([]);
    const [filesAndFolders, setFilesAndFolders] = useState<any[]>([]);
    const [filesAndFoldersDecrypted, setFilesAndFoldersDecrypted] = useState<any[]>([]);
    const user = sessionStorage.getItem("supradriveusername") || "";
    const [folderid, setFolderid] = useState(0);


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
        setEncryptionKey(newKey)
        document.cookie = `encryptionPassword=${newKey}; Secure; SameSite=Strict; Path=/`;
        setIsModalEncryptionOpen(false);
    };

    const handleFileContentChange = async (text: string) => {
        setFileContent(text);

        const password = getEncryptionPassword();
        if (password) {
            const result = await Encrypt(text, password);
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
    const openModalNewFolder = () => setIsModalNewFolderOpen(true);
    const closeModalNewFolder = () => setIsModalNewFolderOpen(false);
    const [error, setError] = useState<string | null>(null);

    const handleDecrypt = async (encryptedText: any, iv: any, salt: any, key: any) => {
        try {
            const jsonInput = JSON.stringify({
                iv,
                salt,
                encryptedText,
            });

            const decrypted = await Decrypt(jsonInput, key);

            if (decrypted) {
                return decrypted;
            } else {
                setError("Decryption failed. Check your inputs.");
            }
        } catch (err) {
            setError("Decryption encountered an error.");
        }
    };

    const refreshFolders = async () => {
        await getFilesAndFolders();
    }

    const getFilesAndFolders = async () => {
        if (folderid === 0) {
            axios.get(APIURL + "/supradrive/folder/1", { withCredentials: true, headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } })
                .then(async (response) => {
                    setFilesAndFolders(response.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            axios.get(APIURL + "/supradrive/filesandfolders/" + folderid, { withCredentials: true, headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } })
                .then(async (response) => {
                    setFilesAndFolders(response.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };

    const createNewFolder = async () => {
        let encryptedfoldername = await Encrypt(folderName, encryptionKey);
        let json = {
            foldersysid: 1,
            foldername: typeof encryptedfoldername === 'string' ? encryptedfoldername : encryptedfoldername.encryptedText,
            foldersalt: typeof encryptedfoldername === 'string' ? encryptedfoldername : encryptedfoldername.salt,
            folderiv: typeof encryptedfoldername === 'string' ? encryptedfoldername : encryptedfoldername.iv,
        }

        let folderjson = JSON.stringify(json);

        await axios.post(APIURL + "/supradrive/folder", folderjson, { withCredentials: true, headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } })
            .then((response) => {
            })
            .catch((error) => {
                console.log(error);
            });
        closeModalNewFolder();
        getFilesAndFolders();
    };

    useEffect(() => {
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
        getFilesAndFolders();
    }, []);


    useEffect(() => {
        const decryptFolders = async () => {
            const decryptedFolders = await Promise.all(
                filesAndFolders.map(async (folder) => {
                    const decryptedName = await handleDecrypt(folder.foldername, folder.folderiv, folder.foldersalt, encryptionKey);
                    return { ...folder, decryptedName };
                })
            );
            setFilesAndFoldersDecrypted(decryptedFolders);
        };

        if (encryptionKey && filesAndFolders.length) {
            decryptFolders();
        }
    }, [encryptionKey, filesAndFolders]);

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
                        {folderid !== 0 && <li className="after:content-['/'] after:px-2">{filesAndFoldersDecrypted.find(folder => folder.folderid === folderid)?.decryptedName}</li>}
                    </ol>
                </nav>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-8 p-4">
                        <h5 className="text-xl font-bold">Encrypted Text files &nbsp; &nbsp;
                            {encryptionKey ? <span className="text-green-500 p-2 rounded-lg bg-green-500/10">Unlocked</span> : <span className="text-red-500 p-2 rounded-lg bg-red-500/10">Locked</span>}


                        </h5>

                        <div className="flex gap-4 pt-4">
                            <button
                                className={`px-4 py-2 text-white rounded-lg focus:ring-2 ${encryptionKey ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" : "bg-red-600 hover:bg-red-700 focus:ring-red-500"}`}
                                onClick={openModalEncryption}
                            >
                                {encryptionKey ? "Change encryption password" : "Set encryption password"}
                            </button>
                            {encryptionKey && (
                                <>
                                    {(folderid !== 0) && (
                                        <>
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500" onClick={encryptionKey ? openModalNewFolder : openModalEncryption}>
                                                New Folder
                                            </button>
                                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500">
                                                Upload Text File
                                            </button>
                                            <button
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                                                onClick={openModal}
                                            >
                                                New Text File
                                            </button>
                                        </>
                                    )}
                                    <button
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                                        onClick={refreshFolders}
                                    >
                                        Refresh Folders
                                    </button>
                                </>
                            )}

                        </div>
                    </div>
                </div>


                <div className="mx-auto space-y-8 px-2 pt-20 lg:px-8 lg:py-8">

                    <div className="rounded-lg bg-vc-border-gradient p-px shadow-lg shadow-black/20">
                        <div className="rounded-lg bg-black p-3.5 lg:p-6 w-full">


                            <div className="prose prose-sm prose-invert max-w-none">
                                <div className="flex items-center justify-between">
                                    {folderid !== 0 && (
                                        <div key={0} onClick={() => setFolderid(0)}>
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
                                                <span className="text-white group-hover:text-gray-300 transition duration-300">..</span>
                                            </div>
                                        </div>
                                    )}
                                    {filesAndFoldersDecrypted.map((folder) => {
                                        if (folder.decryptedName) {
                                            return (
                                                <div key={folder.folderid} onClick={() => setFolderid(folder.folderid)}>
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
                                                        <span className="text-white group-hover:text-gray-300 transition duration-300">{folder.decryptedName}</span>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    })}
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
                                                value={newKey}
                                                onChange={(e) => setNewKey(e.target.value)}
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




                                {isModalNewFolderOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                        <div className="w-full max-w-md bg-gray-800 text-white rounded-lg shadow-lg p-6">
                                            <h4 className="text-lg font-bold mb-4">New folder name</h4>
                                            <input
                                                type="text"
                                                value={folderName}
                                                onChange={(e) => setFolderName(e.target.value)}
                                                className="w-full px-4 py-2 text-lg bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter folder name"
                                            />
                                            <div className="flex justify-end gap-4 mt-4">
                                                <button
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                                                    onClick={closeModalNewFolder}
                                                >
                                                    Close
                                                </button>
                                                <button
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                                                    onClick={createNewFolder}
                                                >
                                                    Create Folder
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

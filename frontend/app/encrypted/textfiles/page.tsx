"use client";

import { useEffect, useState } from "react";
import { redirect } from 'next/navigation';
import axios from 'axios';
import Link from "next/link";
import { Encrypt } from "@/app/components/Encrypt";
import { Decrypt } from "@/app/components/Decrypt";

const APIURL = process.env.NEXT_PUBLIC_APIURL;

export default function Page() {
    const [loading, setLoading] = useState(true);
    const [decrypting, setDecrypting] = useState(false);
    const [savingfile, setSavingfile] = useState(false);
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
    const [decryptedFolders, setDecryptedFolders] = useState<any[]>([]);
    const [decryptedFiles, setDecryptedFiles] = useState<any[]>([]);
    const [folderid, setFolderid] = useState(0);
    const [foldername, setFoldername] = useState("");
    const [upFolderId, setUpFolderId] = useState(0);

    const decryptFilesAndFolders = async () => {
        setDecrypting(true);
        setDecryptedFolders([]);
        setDecryptedFiles([]);
        if (encryptionKey) {
            const decryptedFolders = await Promise.all(
                filesAndFolders[0].folders.map(async (folder: any) => {
                    const decryptedName = await handleDecrypt(folder.foldername, folder.folderiv, folder.foldersalt, encryptionKey);
                    return { ...folder, decryptedName };
                })
            );
            setDecryptedFolders(decryptedFolders);
            const decryptedFiles = await Promise.all(
                filesAndFolders[0].files.map(async (file: any) => {
                    console.log("decrypting file", file);
                    const decryptedName = await handleDecrypt(file.filename, file.filenameiv, file.filenamesalt, encryptionKey);
                    return { ...file, decryptedName };
                })
            );
            setDecryptedFiles(decryptedFiles);
        }
        setDecrypting(false);
    };


    const handleSelectFolder = (newfolderid: number) => {
        setFolderid(newfolderid);
        setFoldername(decryptedFolders.find(folder => folder.folderid === newfolderid)?.decryptedName ?? "");
        setUpFolderId(decryptedFolders.find(folder => folder.folderid === newfolderid)?.foldersubid ?? 0);
        getFilesAndFolders(newfolderid);
    }

    const handleSelectFile = () => {
    }

    const saveFile = async () => {
        setSavingfile(true);
        const password = getEncryptionPassword();
        const EncFilename = await Encrypt(fileName, password);
        const EncContent = await Encrypt(fileContent, password);
        const fileData = {
            folderid: folderid,
            filename: typeof EncFilename === 'string' ? EncFilename : EncFilename.encryptedText,
            filenameiv: typeof EncFilename === 'string' ? '' : EncFilename.iv,
            filenamesalt: typeof EncFilename === 'string' ? '' : EncFilename.salt,
            iv: typeof EncContent === 'string' ? '' : EncContent.iv,
            salt: typeof EncContent === 'string' ? '' : EncContent.salt,
            content: typeof EncContent === 'string' ? EncContent : EncContent.encryptedText,
        };
        await axios.post(APIURL + "/supradrive/encryptedtextfile", fileData, { withCredentials: true, headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"), 'Content-Type': 'application/json' } })
            .then(() => {

            })
            .catch((error) => {
                console.log(error);
            });
        refreshFolders();
        setSavingfile(false);
    };

    const getEncryptionPassword = () => {
        const cookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("encryptionPassword="));
        return cookie ? decodeURIComponent(cookie.split("=")[1]) : "";
    };

    const setCookiePassword = async () => {
        setEncryptionKey(newKey);
        document.cookie = `encryptionPassword=${newKey}; Secure; SameSite=Strict; Path=/`;
        setIsModalEncryptionOpen(false);
    };

    const handleFileContentChange = async (text: string) => {
        setFileContent(text);
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        setSalt(Array.from(salt));
        setIv(Array.from(iv));
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
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            return;
        }
    };

    const refreshFolders = async () => {
        await getFilesAndFolders(folderid);
    }

    const getFilesAndFolders = async (folderiduse: number | undefined) => {
        const folderidext = folderiduse ?? folderid;
        axios.get(APIURL + "/supradrive/folder/" + folderidext, { withCredentials: true, headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"), 'Content-Type': 'application/json' } })
            .then(async (response) => {
                setDecryptedFolders([]);
                setDecryptedFiles([]);
                setFilesAndFolders(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const createNewFolder = async () => {
        const encryptedfoldername = await Encrypt(folderName, encryptionKey);
        const json = {
            foldersysid: 1,
            foldersubid: folderid,
            foldername: typeof encryptedfoldername === 'string' ? encryptedfoldername : encryptedfoldername.encryptedText,
            foldersalt: typeof encryptedfoldername === 'string' ? encryptedfoldername : encryptedfoldername.salt,
            folderiv: typeof encryptedfoldername === 'string' ? encryptedfoldername : encryptedfoldername.iv,
        }

        const folderjson = JSON.stringify(json);

        await axios.post(APIURL + "/supradrive/folder", folderjson, { withCredentials: true, headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"), 'Content-Type': 'application/json' } })
            .then(() => {
            })
            .catch((error) => {
                console.log(error);
            });
        closeModalNewFolder();
        getFilesAndFolders(folderid);
    };

    useEffect(() => {
        const checkToken = async () => {
            try {
                await axios.get(APIURL + "/supradrive/auth/token", {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem("supradrivetoken")}`,
                        'Content-Type': 'application/json',
                    },
                });
                setLoading(false);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                redirect('/login');
            }
        };

        checkToken();
        getFilesAndFolders(folderid);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (encryptionKey && ((filesAndFolders[0].folders.length > 0) || (filesAndFolders[0].files.length > 0))) {
            decryptFilesAndFolders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filesAndFolders, encryptionKey]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <h1 className="text-xl font-medium text-gray-300">Checking authentication...</h1>
            </div>
        );
    }

    if (decrypting) {
        return (
            <div className="flex h-screen items-center justify-center">
                <h1 className="text-xl font-medium text-gray-300">Decrypting...</h1>
            </div>
        );
    }

    if (savingfile) {
        return (
            <div className="flex h-screen items-center justify-center">
                <h1 className="text-xl font-medium text-gray-300">Encrypting and saving file...</h1>
            </div>
        );
    }
    return (
        <>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <nav className="p-4 bg-gray-200 dark:bg-gray-800">
                    <ol className="flex space-x-2">
                        <Link href="/"><li className="after:content-['/'] after:px-2">Home</li></Link>
                        <li className="after:content-['/'] after:px-2">{sessionStorage.getItem("supradriveuser")}</li>
                        <li className="after:content-['/'] after:px-2">Encrypted</li>
                        <li className="after:content-['/'] after:px-2">Text files</li>
                        {folderid !== 0 && <li className="after:content-['/'] after:px-2">{foldername}</li>}
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
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500" onClick={encryptionKey ? openModalNewFolder : openModalEncryption}>
                                        New Folder
                                    </button>
                                    {(folderid !== 0) && (
                                        <>
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

                                <div className="flex flex-wrap items-center justify-start gap-10">
                                    {folderid !== 0 && (
                                        <>
                                            <div key="back0" onClick={() => handleSelectFolder(0)}>
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
                                                    <span className="text-white group-hover:text-gray-300 transition duration-300 text-center max-w-[12.5rem] break-words">
                                                        .
                                                    </span>
                                                </div>
                                            </div>
                                            <div key="back1" onClick={() => handleSelectFolder(upFolderId)}>
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
                                                    <span className="text-white group-hover:text-gray-300 transition duration-300 text-center max-w-[12.5rem] break-words">
                                                        ..
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {decryptedFolders.map((folder) => {
                                        if (folder.decryptedName) {
                                            return (
                                                <div key={folder.folderid} onClick={() => handleSelectFolder(folder.folderid)}>
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
                                                        <span className="text-white group-hover:text-gray-300 transition duration-300 text-center max-w-[12.5rem] break-words">
                                                            {folder.decryptedName}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                    {decryptedFiles.map((file) => {
                                        if (file.decryptedName) {
                                            return (
                                                <div key={file.fileid} onClick={() => handleSelectFile()}>
                                                    <div className="flex flex-col items-center group">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="60"
                                                            height="60"
                                                            viewBox="0 0 24 24"
                                                            className="hi-document-lock text-yellow-500 group-hover:text-yellow-400 transform group-hover:scale-110 transition duration-300"
                                                        >

                                                            <rect x="4" y="2" width="14" height="20" rx="2" ry="2" fill="white" stroke="black" stroke-width="1.5" />
                                                            <path d="M6 6h10M6 10h10M6 14h6" stroke="black" stroke-width="1.5" stroke-linecap="round" />


                                                            <rect x="9" y="16" width="6" height="5" rx="1" ry="1" fill="yellow" stroke="black" stroke-width="1.5" />
                                                            <path d="M11 16V14a2 2 0 1 1 4 0v2" stroke="black" stroke-width="1.5" stroke-linecap="round" />
                                                        </svg>

                                                        <span className="text-white group-hover:text-gray-300 transition duration-300 text-center max-w-[12.5rem] break-words">
                                                            {file.decryptedName}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>

                                {isModalOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                        <div className="w-full max-w-3xl bg-gray-800 text-white rounded-lg shadow-lg p-4">
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
                                )
                                }

                                {isModalEncryptionOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                        <div className="w-full max-w-md bg-gray-800 text-white rounded-lg shadow-lg p-6">
                                            <h4 className="text-lg font-bold mb-4">Set Encryption Password</h4>
                                            <input
                                                type="password"
                                                value={newKey}
                                                onChange={(e) => setNewKey(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && setCookiePassword()} 
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
                                )
                                }




                                {
                                    isModalNewFolderOpen && (
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
                                    )
                                }

                            </div>

                        </div>
                    </div>

                </div>
            </div>

        </>
    );
}

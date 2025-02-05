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
        setDecrypting(true);
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
            <div className="min-h-screen bg-black text-gray-900 dark:text-gray-100">
                <nav className="p-4 bg-black">
                    <ol className="flex space-x-2">
                        <Link href="/"><li className="text-green-700">Home</li></Link>
                        <li className="before:content-['»'] before:pr-2 text-green-700">{sessionStorage.getItem("supradriveuser")}</li>
                        <li className="before:content-['»'] before:pr-2 text-green-700">Encrypted</li>
                        <li className="before:content-['»'] before:pr-2 text-green-700">Text</li>
                        {folderid !== 0 && <li className="before:content-['»'] before:pr-2 text-green-700">{foldername}</li>}
                    </ol>
                </nav>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-8 p-4">
                        <div className="text-xl text-green-500 flex items-center gap-2">
                            <svg className="w-6 h-6" fill={encryptionKey ? "green" : "red"} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3h-6zm3 3a2 2 0 110 4 2 2 0 010-4z"></path>
                            </svg>
                            {encryptionKey ? <span className="text-green-500 p-2 rounded-lg bg-green-500/10">Unlocked</span> : <span className="text-red-500 p-2 rounded-lg bg-red-500/10">Locked</span>}
                            Encrypted Text Files
                        </div>


                        <div className="flex gap-4 pt-4">
                            <button
                                className={`flex item-center gap-1 px-2 py-1 text-sm text-green-500 border border-2 border-green-900 rounded-lg ${encryptionKey ? "bg-transparent hover:border-green-500" : "bg-transparent hover:border-green-500"}`}
                                onClick={openModalEncryption}
                            >
                                <svg width="28" height="28" fill={encryptionKey ? "green" : "red"} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3h-6zm3 3a2 2 0 110 4 2 2 0 010-4z"></path>
                                </svg>
                            </button>
                            {encryptionKey && (
                                <>
                                    <button className="flex item-center gap-1 px-2 py-1 text-sm text-green-500 border border-2 border-green-900 rounded-lg bg-transparent hover:border-green-500" onClick={encryptionKey ? openModalNewFolder : openModalEncryption}>
                                        <svg
                                            width="28"
                                            height="28"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M3 5C3 4.44772 3.44772 4 4 4H10L12 6H20C20.5523 6 21 6.44772 21 7V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V5Z"
                                                fill="#FFC107"
                                                stroke="#E0A800"
                                            />
                                            <circle cx="17" cy="15" r="4" fill="white" stroke="#E0A800" />
                                            <line x1="17" y1="13.5" x2="17" y2="16.5" stroke="#E0A800" />
                                            <line x1="15.5" y1="15" x2="18.5" y2="15" stroke="#E0A800" />
                                        </svg>
                                    </button>
                                    {(folderid !== 0) && (
                                        <>
                                            <button
                                                className="flex item-center gap-1 px-2 py-1 text-sm text-green-500 border border-2 border-green-900 rounded-lg bg-transparent hover:border-green-500"
                                                onClick={openModal}
                                            >
                                                <svg
                                                    width="28"
                                                    height="28"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M6 2C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V8.82843C19 8.29799 18.7893 7.78929 18.4142 7.41421L14.5858 3.58579C14.2107 3.21071 13.702 3 13.1716 3H6Z"
                                                        fill="#F5F5F5"
                                                        stroke="#BDBDBD"
                                                    />

                                                    <line x1="8" y1="10" x2="16" y2="10" stroke="#BDBDBD" />
                                                    <line x1="8" y1="14" x2="16" y2="14" stroke="#BDBDBD" />
                                                    <line x1="8" y1="18" x2="14" y2="18" stroke="#BDBDBD" />

                                                    <circle cx="17" cy="15" r="4" fill="white" stroke="#BDBDBD" />
                                                    <line x1="17" y1="13.5" x2="17" y2="16.5" stroke="#BDBDBD" />
                                                    <line x1="15.5" y1="15" x2="18.5" y2="15" stroke="#BDBDBD" />
                                                </svg>
                                            </button>
                                            <button className="flex item-center gap-1 px-2 py-1 text-sm text-green-500 border border-2 border-green-900 rounded-lg bg-transparent hover:border-green-500">
                                                <svg
                                                    width="28"
                                                    height="28"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M6 2C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V8.82843C19 8.29799 18.7893 7.78929 18.4142 7.41421L14.5858 3.58579C14.2107 3.21071 13.702 3 13.1716 3H6Z"
                                                        fill="#E3F2FD"
                                                    />

                                                    <path
                                                        d="M12 16V10"
                                                        stroke="#1976D2"
                                                    />
                                                    <path
                                                        d="M9 12L12 9L15 12"
                                                        stroke="#1976D2"
                                                        stroke-width="1.5"
                                                    />

                                                    <line
                                                        x1="8" y1="18" x2="16" y2="18"
                                                        stroke="#1976D2"
                                                    />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </>
                            )}

                        </div>
                    </div>
                </div>


                <div className="mx-auto space-y-8 px-2 pt-8 lg:px-8 lg:py-8">

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

                                                            <rect x="4" y="2" width="14" height="20" rx="2" ry="2" fill="white" stroke="black" />
                                                            <path d="M6 6h10M6 10h10M6 14h6" stroke="black" />


                                                            <rect x="9" y="16" width="6" height="5" rx="1" ry="1" fill="yellow" stroke="black" />
                                                            <path d="M11 16V14a2 2 0 1 1 4 0v2" stroke="black" />
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

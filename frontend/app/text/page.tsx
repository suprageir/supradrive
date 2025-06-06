"use client";
import { useCallback, useEffect, useState } from "react";
import axios from 'axios';
import Link from "next/link";
import { Encrypt } from "@/app/components/Encrypt";
import { Decrypt } from "@/app/components/Decrypt";
import crypto from 'crypto';
import moment from 'moment';
import { motion } from "framer-motion";
import LoadingScreen from "@/app/components/LoadingScreen";
import { DropEvent, FileRejection, useDropzone } from 'react-dropzone';
import ProgressBar from "@/app/components/ProgressBar";


const APIURL = process.env.NEXT_PUBLIC_APIURL;

interface UploadProgressType {
    [key: string]: {
        progress: number;
        speed: number;
        timeRemaining: string;
    };
}

export default function Page() {
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState("");
    const [username, setUsername] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [userid, setUserid] = useState("");
    const [decrypting, setDecrypting] = useState(false);
    const [savingfile, setSavingfile] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalEncryptionOpen, setIsModalEncryptionOpen] = useState(false);
    const [isModalNewFolderOpen, setIsModalNewFolderOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [fileName, setFileName] = useState("Untitled");
    const [fileContent, setFileContent] = useState("");
    const [fileContentSaved, setFileContentSaved] = useState(false);
    const [encryptionKey, setEncryptionKey] = useState("");
    const [newKey, setNewKey] = useState("");
    const [filesAndFolders, setFilesAndFolders] = useState<any[]>([]);
    const [decryptedFolders, setDecryptedFolders] = useState<any[]>([]);
    const [decryptedFiles, setDecryptedFiles] = useState<any[]>([]);
    const [fileRevisions, setFileRevisions] = useState<any[]>([]);
    const [folderid, setFolderid] = useState(0);
    const [foldername, setFoldername] = useState("");
    const [fileSaved, setFileSaved] = useState("");
    const [upFolderId, setUpFolderId] = useState(0);
    const [fileid, setFileid] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const [fileidref, setFileidRef] = useState(0);
    const [filenameencrypted, setFilenameEncrypted] = useState("");
    const [filenamedisk, setFilenameDisk] = useState("");
    const [filenameiv, setFilenameIV] = useState("");
    const [filenamesalt, setFilenameSalt] = useState("");
    const [filesha1, setFileSHA1] = useState("");
    const [filefolderid, setFileFolderid] = useState(0);
    const [fileiv, setFileIV] = useState("");
    const [filesalt, setFileSalt] = useState("");
    const [filecontentencrypted, setFileContentEncrypted] = useState("");
    const [filecurrentrevision, setFileCurrentRevision] = useState(true);
    const [isModalUploadTXTFilesOpen, setIsModalUploadTXTFilesOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [uploadProgress, setUploadProgress] = useState<UploadProgressType>({});
    const [decryptedtotalnum, setDecryptedtotalnum] = useState(0);
    const [decryptednum, setDecryptednum] = useState(0);


    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [progress, setProgress] = useState(0);



    const readFileAsText = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    const onDropTXTFiles = useCallback((acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
        if ('stopPropagation' in event) {
            event.stopPropagation();
        }
        setFiles(prevFiles => [...prevFiles, ...acceptedFiles]); // Add files to queue

        if (!uploading) {
            handleUploadNextFile(0, [...acceptedFiles]); // Start uploading the first file
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploading, folderid, encryptionKey]);

    const handleUploadNextFile = async (index: number, fileQueue: File[]) => {
        if (index >= fileQueue.length) {
            // If all files are uploaded, reset the state and finish
            setUploading(false);
            handleAllFilesUploaded();
            return;
        }

        const file = fileQueue[index];
        setUploading(true);
        const startTime = Date.now();
        const lastLoaded = 0;
        const lastTime = startTime;
        const password = getEncryptionPassword();

        const EncFilename = await Encrypt(file.name, password);
        const filename = typeof EncFilename === 'string' ? EncFilename : EncFilename.encryptedText;
        const filenameiv = typeof EncFilename === 'string' ? '' : EncFilename.iv;
        const filenamesalt = typeof EncFilename === 'string' ? '' : EncFilename.salt;

        // const FileSHA1 = crypto.createHash('sha1').update(fileContent).digest('hex');
        // const fileData = {
        //     folderid: folderid,
        //     filename: typeof EncFilename === 'string' ? EncFilename : EncFilename.encryptedText,
        //     filenameiv: typeof EncFilename === 'string' ? '' : EncFilename.iv,
        //     filenamesalt: typeof EncFilename === 'string' ? '' : EncFilename.salt,
        //     filesha1: FileSHA1,
        //     fileid: fileid,
        //     iv: typeof EncContent === 'string' ? '' : EncContent.iv,
        //     salt: typeof EncContent === 'string' ? '' : EncContent.salt,
        //     content: typeof EncContent === 'string' ? EncContent : EncContent.encryptedText,
        // };




        try {
            // Read file as text (string)
            const fileText = await readFileAsText(file);
            const FileSHA1 = crypto.createHash('sha1').update(fileText).digest('hex');

            // Encrypt the file text
            const encryptedData = await Encrypt(fileText, password);

            let encryptedBlob;
            // Convert encrypted data to a Blob
            if (typeof encryptedData === "object" && "encryptedText" in encryptedData) {
                encryptedBlob = new Blob([encryptedData.encryptedText], { type: "text/plain" });
            } else {
                console.error("Invalid encryptedData format");
            }

            // Create a new File object from the encrypted Blob
            const encryptedFile = new File([encryptedBlob ?? new Blob()], file.name, { type: "application/octet-stream" });

            const encryptedFileWithNewName = new File([encryptedFile], filename, {
                type: encryptedFile.type,
                lastModified: encryptedFile.lastModified,
            });





            const formData = new FormData();
            formData.append('token', token);
            formData.append('folderid', folderid.toString());
            const iv = typeof encryptedData === 'object' ? encryptedData.iv : '';
            const salt = typeof encryptedData === 'object' ? encryptedData.salt : '';
            formData.append('iv', JSON.stringify(iv));
            formData.append('salt', JSON.stringify(salt));

            formData.append('file', encryptedFileWithNewName);

            formData.append('filename', filename);
            formData.append('filenameiv', JSON.stringify(filenameiv));
            formData.append('filenamesalt', JSON.stringify(filenamesalt));
            formData.append('filesha1', FileSHA1);


            await axios.post(APIURL + "/supradrive/encrypted/uploadtxtfiles", formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"), },
                onUploadProgress: (event) => {
                    if (event.total) {
                        const currentTime = Date.now();
                        const loaded = event.loaded;
                        const deltaTime = (currentTime - lastTime) / 1000; // konverter til sekunder
                        const deltaLoaded = loaded - lastLoaded;

                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const speed = Number(((deltaLoaded / (1024 * 1024)) / deltaTime).toFixed(2));

                        const remainingBytes = event.total - event.loaded;
                        const remainingSeconds = remainingBytes / (deltaLoaded / deltaTime);

                        let timeRemaining = '';
                        if (remainingSeconds < 60) {
                            timeRemaining = `${Math.round(remainingSeconds)}s`;
                        } else if (remainingSeconds < 3600) {
                            timeRemaining = `${Math.round(remainingSeconds / 60)}m ${Math.round(remainingSeconds % 60)}s`;
                        } else {
                            const hours = Math.floor(remainingSeconds / 3600);
                            const minutes = Math.round((remainingSeconds % 3600) / 60);
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            timeRemaining = `${hours}h ${minutes}m`;
                        }
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const progress = Math.round((event.loaded * 100) / event.total);
                        // setProgress(prevProgress => ({
                        //     ...prevProgress,
                        //     [file.name]: { progress, speed, timeRemaining }
                        // }));
                    }
                },
            });

            // setProgress(prevProgress => ({
            //     ...prevProgress,
            //     [file.name]: { progress: 100, speed: 0, timeRemaining: "" }
            // }));

            // Move to the next file
            handleUploadNextFile(index + 1, fileQueue); // Recursively call the next file upload

        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const { getRootProps: getRootPropsTXTFiles, getInputProps: getInputPropsTXTFiles, isDragActive } = useDropzone({
        onDrop: onDropTXTFiles,
        multiple: true,
        accept: {
            'text/*': []
        },
        maxFiles: 100,
    });


    const handleAllFilesUploaded = () => {
        setUploading(false);
        setFiles([]);
        setProgress(100);
        setIsModalUploadTXTFilesOpen(false);
        getFilesAndFolders(folderid);
    }

    // const handleUploadTXTFiles = async () => {
    //     setUploading(true);
    //     setProgress(0);

    //     const formData = new FormData();
    //     files.forEach(file => {
    //         formData.append('files', file);
    //     });

    //     try {
    //         await axios.post(APIURL + "/supradrive/encrypted/uploadtxtfiles", formData, {
    //             headers: {
    //                 'Content-Type': 'multipart/form-data',
    //                 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"),
    //             },
    //             onUploadProgress: (event) => {
    //                 if (event.total) {
    //                     setProgress(Math.round((event.loaded * 100) / event.total));
    //                 }
    //             },
    //         });
    //         setFiles([]);
    //         setProgress(100);
    //     } catch (error) {
    //         console.error('Upload failed:', error);
    //     } finally {
    //         setUploading(false);
    //     }
    // };




    type MenuItem = {
        label: string;
        action: () => void;
    };

    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [context, setContext] = useState<string | null>(null);

    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        const target = event.target as HTMLElement;

        if (target.closest(".FileMenu")) {
            setContext("box");
            setMenuItems([
                { label: "View", action: () => alert("Open") },
                { label: "Delete", action: () => alert("Deleted") },
            ]);
        } else if (target.closest(".text-item")) {
            setContext("text");
            setMenuItems([
                { label: "Copy Text", action: () => alert("Text Copied") },
                { label: "Change Text", action: () => alert("Changing Text") },
            ]);
        } else {
            setContext("default");
            setMenuItems([{ label: "Refresh", action: () => window.location.reload() }]);
        }

        setMenuPosition({ x: event.clientX, y: event.clientY });
    };

    const handleClickOutside = () => setMenuPosition(null);

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const decryptFilesAndFolders = async () => {
        setDecryptednum(0);
        setDecrypting(true);
        setDecryptedFolders([]);
        setDecryptedFiles([]);
        if (encryptionKey) {
            const decryptedFoldersArray: any[] = [];
            for (const folder of filesAndFolders[0].folders) {
                const decryptedName = await handleDecrypt(folder.foldername, folder.folderiv, folder.foldersalt, encryptionKey);
                setDecryptednum((prev) => prev + 1);
                folder.decryptedName = decryptedName;
                decryptedFoldersArray.push({ ...folder, decryptedName });

            }
            setDecryptedFolders(decryptedFoldersArray);

            const decryptedFilesArray: any[] = [];
            for (const file of filesAndFolders[0].files) {
                const decryptedName = await handleDecrypt(file.filename, file.filenameiv, file.filenamesalt, encryptionKey);
                setDecryptednum((prev) => prev + 1);
                file.decryptedName = decryptedName;
                decryptedFilesArray.push({ ...file, decryptedName });
            }
            setDecryptedFiles(decryptedFilesArray);
        }

        setDecrypting(false);
    };

    const handleSelectFolder = (newfolderid: number) => {
        setFolderid(newfolderid);
        setFoldername(decryptedFolders.find(folder => folder.folderid === newfolderid)?.decryptedName ?? "");
        setUpFolderId(decryptedFolders.find(folder => folder.folderid === newfolderid)?.foldersubid ?? 0);
        getFilesAndFolders(newfolderid);
    }

    const saveFile = async () => {
        setSavingfile(true);
        const password = getEncryptionPassword();
        let EncFilename;
        if (!fileName.endsWith(".txt")) {
            EncFilename = await Encrypt(fileName + ".txt", password);
        }
        else {
            EncFilename = await Encrypt(fileName, password);
        }
        const EncContent = await Encrypt(fileContent, password);
        const FileSHA1 = crypto.createHash('sha1').update(fileContent).digest('hex');
        const fileData = {
            folderid: folderid,
            filename: typeof EncFilename === 'string' ? EncFilename : EncFilename.encryptedText,
            filenameiv: typeof EncFilename === 'string' ? '' : EncFilename.iv,
            filenamesalt: typeof EncFilename === 'string' ? '' : EncFilename.salt,
            filesha1: FileSHA1,
            fileid: fileid,
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

    const handleOpenTXTFile = async (fileid: number) => {
        setIsModalOpen(true);
        axios.get(APIURL + "/supradrive/encrypted/textfile/" + fileid, { withCredentials: true, headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"), 'Content-Type': 'application/json' } })
            .then(async (response) => {
                setDecrypting(true);
                setFileid(response.data[0].fileinfo[0]?.fileid || 0);
                setFileFolderid(response.data[0].fileinfo[0]?.folderid || 0);
                setFileidRef(response.data[0].fileinfo[0]?.fileidref || 0);
                setFilenameEncrypted(response.data[0].fileinfo[0]?.filename || "");
                setFilenameDisk(response.data[0].fileinfo[0]?.filenamedisk || "");
                setFilenameIV(response.data[0].fileinfo[0]?.filenameiv || "");
                setFilenameSalt(response.data[0].fileinfo[0]?.filenamesalt || "");
                setFileIV(response.data[0].fileinfo[0]?.iv || "");
                setFileSalt(response.data[0].fileinfo[0]?.salt || "");
                setFileSHA1(response.data[0].fileinfo[0]?.filesha1 || "");
                setFileSaved(response.data[0]?.fileinfo[0]?.filets || "");
                setFileName(await handleDecrypt(response.data[0]?.fileinfo[0]?.filename, response.data[0]?.fileinfo[0]?.filenameiv, response.data[0]?.fileinfo[0]?.filenamesalt, encryptionKey) || "");
                setFileContent(await handleDecrypt(response.data[0]?.fileContent, response.data[0]?.fileinfo[0]?.iv, response.data[0]?.fileinfo[0]?.salt, encryptionKey) || "");
                setFileContentSaved(true);
                setFileContentEncrypted(response.data[0]?.fileContent || "");
                setFileRevisions(response.data[0]?.revisions || []);
                setFileCurrentRevision(response.data[0]?.fileinfo[0]?.currentfile || false);
                setDecrypting(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }

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
        setFileContentSaved(false);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setFileid(0);
        setFileContent("");
        setFileName("Untitled");
    }
    const closeModalEncryption = () => setIsModalEncryptionOpen(false);
    const openModalNewFolder = () => {
        setIsModalNewFolderOpen(true);
        setIsModalEncryptionOpen(false);
    }
    const closeModalNewFolder = () => {
        setIsModalNewFolderOpen(false);
        setFolderName("");
    }

    const openModalUploadTXTFiles = () => {
        setIsModalUploadTXTFilesOpen(true);
    }
    const closeModalUploadTXTFiles = () => {
        setIsModalUploadTXTFilesOpen(false);
    }

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
        axios.get(APIURL + "/supradrive/encrypted/folder/" + folderidext, { withCredentials: true, headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"), 'Content-Type': 'application/json' } })
            .then(async (response) => {
                console.log(response.data);
                setDecryptedFolders([]);
                setDecryptedFiles([]);
                setFilesAndFolders(response.data);
                setDecryptedtotalnum(response.data[0]?.files.length + response.data[0]?.folders.length);
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

        await axios.post(APIURL + "/supradrive/encrypted/folder", folderjson, { withCredentials: true, headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"), 'Content-Type': 'application/json' } })
            .then(() => {
            })
            .catch((error) => {
                console.log(error);
            });
        closeModalNewFolder();
        getFilesAndFolders(folderid);
        setFolderName("");
    };

    useEffect(() => {
        setUsername(sessionStorage.getItem("supradriveuser") || "");
        setUserid(sessionStorage.getItem("supradriveuserid") || "");
        setToken(sessionStorage.getItem("supradrivetoken") || "");
        setLoading(false);
        getFilesAndFolders(folderid);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (encryptionKey && ((filesAndFolders[0]?.folders?.length > 0) || (filesAndFolders[0]?.files?.length > 0))) {
            decryptFilesAndFolders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filesAndFolders, encryptionKey]);

    useEffect(() => {
        if (decryptedtotalnum > 0) {
            setProgress(Math.round((decryptednum / decryptedtotalnum) * 100));
        }
    }, [decryptednum, decryptedtotalnum]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black">
                <LoadingScreen text="Checking authentication" />
            </div>
        );
    }

    if (decrypting) {
        const progress = (decryptednum / decryptedtotalnum) * 100;
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black">
                <div className="flex flex-col items-center gap-y-4">
                    <LoadingScreen text={`Decrypting ${progress.toFixed(0)}% (${decryptednum} / ${decryptedtotalnum})`} />
                    <div className="w-64">
                        <ProgressBar progress={Number(progress.toFixed(0))} />
                    </div>
                </div>
            </div>
        );
    }

    if (savingfile) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black">
                <LoadingScreen text="Saving file" />
            </div>
        );
    }
    return (
        <>
            <div className="min-h-screen bg-black text-gray-900 dark:text-gray-100">
                <nav className="p-4 bg-black">
                    <ol className="flex space-x-2">
                        <Link href="/"><li className="text-green-700">Home</li></Link>
                        <li className="before:content-['»'] before:pr-2 text-green-700">{username}</li>
                        <li className="before:content-['»'] before:pr-2 text-green-700">Text</li>
                        {folderid !== 0 && <li className="before:content-['»'] before:pr-2 text-green-700">{foldername}</li>}
                    </ol>
                </nav>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-8 p-2">
                        <div className="text-xl text-green-500 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="grey" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"></path>
                                <path d="M14 2v6h6"></path>
                                <path d="M16 13H8"></path>
                                <path d="M16 17H8"></path>
                                <path d="M8 9h2"></path>
                            </svg>
                            Text Files
                        </div>


                        <div className="flex gap-4 pt-4">
                            <>
                                <button className="flex item-center gap-1 px-2 py-1 text-sm text-green-500 border border-2 border-green-900 rounded-lg bg-transparent hover:border-green-500" onClick={openModalNewFolder}>
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
                                        <button
                                            className="flex item-center gap-1 px-2 py-1 text-sm text-green-500 border border-2 border-green-900 rounded-lg bg-transparent hover:border-green-500"
                                            onClick={openModalUploadTXTFiles}
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
                                                    fill="#E3F2FD"
                                                />

                                                <path
                                                    d="M12 16V10"
                                                    stroke="#1976D2"
                                                />
                                                <path
                                                    d="M9 12L12 9L15 12"
                                                    stroke="#1976D2"
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
                        </div>
                    </div>
                </div>


                <div className="mx-auto space-y-8 px-2 lg:px-8 lg:py-8">
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
                                                <div key={file.fileid} onClick={() => handleOpenTXTFile(file.fileid)}>
                                                    <div className="FileMenu flex flex-col items-center group" onContextMenu={handleContextMenu}>
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
                                                    {menuPosition && (
                                                        <ul
                                                            className="absolute bg-black text-green-700 shadow-lg border rounded-lg w-40 p-2 space-y-2"
                                                            style={{ top: menuPosition.y, left: menuPosition.x }}
                                                        >
                                                            {menuItems.map((item, index) => (
                                                                <li
                                                                    key={index}
                                                                    className="p-2 hover:text-green-500 cursor-pointer"
                                                                    onClick={() => {
                                                                        item.action();
                                                                        setMenuPosition(null);
                                                                    }}
                                                                >
                                                                    {item.label}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            );
                                        }
                                    })}
                                </div>

                                {isModalOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                        <div className="w-full h-full bg-black rounded-none shadow-lg p-6 flex flex-col">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 text-green-700">
                                                <input
                                                    type="text"
                                                    value={fileName}
                                                    onChange={(e) => {
                                                        if (!fileName.endsWith(".txt")) {
                                                            setFileName(fileName + ".txt");
                                                        }
                                                        setFileName(e.target.value)
                                                    }}
                                                    className="w-full sm:w-2/3 px-3 py-2 text-lg bg-neutral-900 rounded-lg focus:ring-2 focus:ring-green-900 focus:outline-none"
                                                    placeholder="Enter file name"
                                                    disabled={!filecurrentrevision}
                                                />
                                                <div className="mt-2 sm:mt-0">
                                                    {filecurrentrevision ? (
                                                        fileContentSaved ? (
                                                            <span className="text-green-500">
                                                                {fileSaved ? moment.unix(parseInt(fileSaved)).format("DD.MM.YYYY HH:mm:ss") : "never"}
                                                            </span>
                                                        ) : (
                                                            <span className="text-red-500">Not saved</span>
                                                        )
                                                    ) : (
                                                        <span className="text-red-700">
                                                            (Rev {moment.unix(parseInt(fileSaved)).format("DD.MM.YYYY HH:mm:ss")})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    key={0}
                                                    onClick={() => setActiveTab(0)}
                                                    className={`relative px-4 py-2 text-sm font-medium focus:outline-none transition-colors ${activeTab === 0 ? "text-green-500" : "text-gray-500"
                                                        }`}
                                                >
                                                    Content
                                                    {activeTab === 0 && (
                                                        <motion.div
                                                            layoutId="underline"
                                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700"
                                                        />
                                                    )}
                                                </button>
                                                <button
                                                    key={1}
                                                    onClick={() => setActiveTab(1)}
                                                    className={`relative px-4 py-2 text-sm font-medium focus:outline-none transition-colors ${activeTab === 1 ? "text-green-500" : "text-gray-500"
                                                        }`}
                                                >
                                                    Revisions ({fileRevisions?.length})
                                                    {activeTab === 1 && (
                                                        <motion.div
                                                            layoutId="underline"
                                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700"
                                                        />
                                                    )}
                                                </button>
                                                <button
                                                    key={2}
                                                    onClick={() => setActiveTab(2)}
                                                    className={`relative px-4 py-2 text-sm font-medium focus:outline-none transition-colors ${activeTab === 2 ? "text-green-500" : "text-gray-500"
                                                        }`}
                                                >
                                                    File Info
                                                    {activeTab === 2 && (
                                                        <motion.div
                                                            layoutId="underline"
                                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700"
                                                        />
                                                    )}
                                                </button>
                                            </div>
                                            {activeTab === 0 && (
                                                <motion.div
                                                    key={0}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="h-full flex flex-col"
                                                >
                                                    <textarea
                                                        className="flex-1 w-full h-full p-2 bg-neutral-900 text-white focus:ring-2 focus:ring-green-900 focus:outline-none resize-none mt-4"
                                                        value={fileContent}
                                                        onChange={(e) => handleFileContentChange(e.target.value)}
                                                        placeholder="Write your text here..."
                                                        disabled={!filecurrentrevision}
                                                    >
                                                    </textarea>
                                                    <div className="flex justify-between text-green-700 mt-4">
                                                        <div className="flex items-center gap-2">
                                                        </div>

                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                className="flex items-center px-4 py-1 border border-green-900 text-green-700 rounded-lg hover:border-green-500 hover:text-green-500 focus:ring-2 focus:ring-green-500"
                                                                onClick={() => {
                                                                    saveFile();
                                                                    closeModal();
                                                                }}
                                                                disabled={!filecurrentrevision}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 22 22"
                                                                    width="18"
                                                                    height="18"
                                                                    className="mr-2 transform transition-transform duration-200 hover:scale-110"
                                                                >
                                                                    <path d="M9 19l-7-7 1.41-1.41L9 16.17l11.59-11.59L22 6l-13 13z" fill="green" />
                                                                </svg>
                                                                Save
                                                            </button>
                                                            <button
                                                                className="flex items-center px-4 py-1 border border-red-900 text-red-700 rounded-lg hover:border-red-500 hover:text-red-500 focus:ring-2 focus:ring-red-500"
                                                                onClick={closeModal}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    width="18"
                                                                    height="18"
                                                                    className="mr-2 transform transition-transform duration-200 hover:scale-110"
                                                                >
                                                                    <path d="M6 6L18 18M18 6L6 18" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                Close
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 1 && (
                                                <motion.div
                                                    key={0}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="h-full flex flex-col"
                                                >
                                                    <div className="flex flex-col gap-2 mt-4 text-green-700">
                                                        {fileRevisions?.map((revision) => {
                                                            return (
                                                                <div key={"rev" + revision.fileid}>
                                                                    {moment.unix(parseInt(revision.filets)).format("DD.MM.YYYY HH:mm:ss")}
                                                                    <button className="px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-2 inline-flex items-center gap-2 text-xs ml-4" onClick={() => {
                                                                        setActiveTab(0);
                                                                        handleOpenTXTFile(revision.fileid);
                                                                    }}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-3-3 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.46 21.438V12.707c0-1.689-.95-2.389-1.814-1.732L1.516 12.707c-.766.657-.066 1.607.7 1.607h10.234c.734 0 1.434-.693 1.434-1.607V2.562a1.625 1.625 0 00-2.425-.143L1.233 11.234a1.625 1.625 0 000 2.268l8.265 7.515a1.625 1.625 0 002.425-.143z" />
                                                                        </svg>
                                                                        View
                                                                    </button>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>

                                                </motion.div>
                                            )}

                                            {activeTab === 2 && (
                                                <motion.div
                                                    key={0}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="h-full flex flex-col break-all"
                                                >
                                                    <div className="flex flex-col mt-4 text-green-700 space-y-1">
                                                        <span className="text-green-700 text-xs">Folder ID / File ID:</span>
                                                        <span className="text-green-500 text-md">#{filefolderid} / #{fileid} {fileidref ? " (Original File ID: " + fileidref + ")" : ""}</span><br />
                                                        <span className="text-green-700 text-xs">File Name:</span>
                                                        <span className="text-green-500 text-md">{fileName}</span>
                                                        <br />
                                                        <span className="text-green-700 text-xs">Last saved:</span>
                                                        <span className="text-green-500 text-md">{fileSaved ? moment.unix(parseInt(fileSaved)).format("DD.MM.YYYY HH:mm:ss") : "never"}</span>
                                                        <br />
                                                        <span className="text-green-700 text-xs">File Name Encrypted:</span>
                                                        <span className="text-gray-600 text-xs"><i>IV: {filenameiv} / Salt: {filenamesalt}</i></span>
                                                        <span className="text-green-500 text-md">{filenameencrypted}</span>
                                                        <br />
                                                        <span className="text-green-700 text-xs">File Name Disk:</span>
                                                        <span className="text-green-500 text-md">{filenamedisk}.txt</span><br />
                                                        <span className="text-green-700 text-xs">SHA1 checksum:</span>
                                                        <span className="text-green-500 text-md">{filesha1}</span><br />
                                                        <span className="text-green-700 text-xs">Encrypted Content:</span>
                                                        <span className="text-gray-600 text-xs"><i>IV: {fileiv} / Salt: {filesalt}</i></span>
                                                        <span className="text-green-500 text-md">{filecontentencrypted}</span>
                                                    </div>

                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                )}


                                {isModalEncryptionOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                        <div className="w-full max-w-md bg-black text-green-700 rounded-lg shadow-lg p-6">
                                            <h4 className="text-lg mb-4">Set encryption passphrase:</h4>
                                            <input
                                                type="password"
                                                value={newKey}
                                                onChange={(e) => setNewKey(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && setCookiePassword()}
                                                className="w-full px-4 py-2 border border-green-900 text-lg bg-black focus:border-green-700 focus:outline-none"
                                                placeholder="Enter passphrase"
                                                autoFocus
                                            />
                                            <div className="flex justify-end gap-4 mt-4">
                                                <button
                                                    className="flex items-center px-4 py-1 border border-green-900 text-green-700 rounded-lg hover:border-green-500 hover:text-green-500 focus:ring-2 focus:ring-green-500"
                                                    onClick={setCookiePassword}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 22 22"
                                                        width="18"
                                                        height="18"
                                                        className="mr-2 transform transition-transform duration-200 hover:scale-110"
                                                    >
                                                        <path d="M9 19l-7-7 1.41-1.41L9 16.17l11.59-11.59L22 6l-13 13z" fill="green" />
                                                    </svg>
                                                    Activate
                                                </button>
                                                <button
                                                    className="flex items-center px-4 py-1 border border-red-900 text-red-700 rounded-lg hover:border-red-500 hover:text-red-500 focus:ring-2 focus:ring-red-500"
                                                    onClick={closeModalEncryption}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        width="18"
                                                        height="18"
                                                        className="mr-2 transform transition-transform duration-200 hover:scale-110"
                                                    >
                                                        <path d="M6 6L18 18M18 6L6 18" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                                }


                                {isModalUploadTXTFilesOpen && (
                                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
                                        {!uploading && ( // Hide the upload box when uploading
                                            <div
                                                style={{ width: 500, height: 70 }}
                                                {...getRootPropsTXTFiles()}
                                                className={`border-2 ${isDragActive ? 'border-green-500' : 'border-green-900'} rounded-md p-5 text-center cursor-pointer transition-colors duration-200`}
                                            >
                                                <input {...getInputPropsTXTFiles()} />
                                                <div className="text-green-700">
                                                    {isDragActive ?
                                                        "Drop the files here ..." :
                                                        "Drag & drop some files here, or click to select files"}
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-4">
                                            {files.map((file) => (
                                                <div key={file.name} className="mb-2 mr-5 ml-5">
                                                    <div className="flex flex-col items-center justify-center bg-black">
                                                        <ProgressBar progress={uploadProgress[file.name]?.progress || 0} />
                                                    </div>
                                                    <div className="text-green-700 text-xs">
                                                        {file.name} ({uploadProgress[file.name]?.progress || 0}%)
                                                        {uploadProgress[file.name]?.speed > 0 &&
                                                            ` - ${uploadProgress[file.name]?.speed} MB/s (${uploadProgress[file.name]?.timeRemaining})`
                                                        }
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-700 rounded-full">
                                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${uploadProgress[file.name]?.progress || 0}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex items-center justify-center gap-4 mt-4">
                                            <button
                                                className="mt-4 px-4 py-1 border border-red-900 text-red-700 rounded-lg hover:border-red-500 hover:text-red-500 focus:ring-2 focus:ring-red-500 flex items-center"
                                                onClick={closeModalUploadTXTFiles}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    width="18"
                                                    height="18"
                                                    className="mr-2 transform transition-transform duration-200 hover:scale-110"
                                                >
                                                    <path d="M6 6L18 18M18 6L6 18" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )
                                }


                                {
                                    isModalNewFolderOpen && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                            <div className="w-full max-w-md bg-black text-green-700 rounded-lg shadow-lg p-6">
                                                <h4 className="text-lg mb-4">New folder name</h4>
                                                <input
                                                    type="text"
                                                    value={folderName}
                                                    onKeyDown={(e) => e.key === "Enter" && createNewFolder()}
                                                    onChange={(e) => setFolderName(e.target.value)}
                                                    className="w-full px-4 py-2 text-lg border border-green-900 focus:ring-green-700 focus:outline-none"
                                                    placeholder="Enter folder name"
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-4 mt-4">
                                                    <button
                                                        className="flex items-center px-4 py-1 border border-green-900 text-green-700 rounded-lg hover:border-green-500 hover:text-green-500 focus:ring-2 focus:ring-green-500"
                                                        onClick={createNewFolder}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 22 22"
                                                            width="18"
                                                            height="18"
                                                            className="mr-2 transform transition-transform duration-200 hover:scale-110"
                                                        >
                                                            <path d="M9 19l-7-7 1.41-1.41L9 16.17l11.59-11.59L22 6l-13 13z" fill="green" />
                                                        </svg>
                                                        Create folder
                                                    </button>
                                                    <button
                                                        className="flex items-center px-4 py-1 border border-red-900 text-red-700 rounded-lg hover:border-red-500 hover:text-red-500 focus:ring-2 focus:ring-red-500"
                                                        onClick={closeModalNewFolder}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            width="18"
                                                            height="18"
                                                            className="mr-2 transform transition-transform duration-200 hover:scale-110"
                                                        >
                                                            <path d="M6 6L18 18M18 6L6 18" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        Close
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
            </div >

        </>
    );
}

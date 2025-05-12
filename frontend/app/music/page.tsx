"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from 'axios';
import Link from "next/link";
import LoadingScreen from "@/app/components/LoadingScreen";
import { DropEvent, FileRejection, useDropzone } from 'react-dropzone';
import moment from "moment";
import Notification from "@/app/components/Notification";
import MusicPlayer from "@/app/components/MusicPlayer";

const APIURL = process.env.NEXT_PUBLIC_APIURL;
const MAX_FILE_SIZE = 100 * 1024 * 1024 * 1024; // 100GB in bytes

const isValidObject = (val: unknown): val is Record<string, unknown> => {
    return typeof val === "object" && val !== null && !Array.isArray(val);
};

interface UploadProgressType {
    [key: string]: {
        progress: number;
        speed: number;
        timeRemaining: string;
        error?: string;
    };
}
const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

export default function Page() {
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState("");
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationType, setNotificationType] = useState<"success" | "error" | "warning" | "info">("success");
    const [username, setUsername] = useState("");
    const [musicFolders, setMusicFolders] = useState<any[]>([]);
    const [musicFiles, setMusicFiles] = useState<any[]>([]);
    const [isModalNewFolderOpen, setIsModalNewFolderOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [folderid, setFolderid] = useState(0);
    const [foldername, setFoldername] = useState("");
    const [upFolderId, setUpFolderId] = useState(0);
    const [uploadProgress, setUploadProgress] = useState<UploadProgressType>({});
    const [isModalUploadMusicOpen, setIsModalUploadMusicOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);
    const [thumbSize, setThumbSize] = useState(100);
    const [music, setMusic] = useState<number>(0);
    const inputHashtagsRef = useRef<HTMLInputElement>(null);
    const inputUserTagsRef = useRef<HTMLInputElement>(null);
    const [startX, setStartX] = useState<number | null>(null);
    const inputLocationRef = useRef<HTMLInputElement>(null);
    const [currentUploadFile, setCurrentUploadFile] = useState<string[]>([]);
    const [currentUploadSize, setCurrentUploadSize] = useState<number>(0);
    const [currentUploadedSize, setCurrentUploadedSize] = useState<number>(0);
    const [displayMusicInfo, setDisplayMusicInfo] = useState<boolean>(false);
    const [currentMusicIndex, setCurrentMusicIndex] = useState<number>(0);

    const handleChangeThumbSize = (size: number | null) => {
        if (size) {
            setThumbSize(size);
        }
        else {
            if (thumbSize === 100) {
                setThumbSize(200);
            }
            else if (thumbSize === 200) {
                setThumbSize(300);
            }
            else if (thumbSize === 300) {
                setThumbSize(100);
            }
        }
    };

    const onDropMusic = useCallback((acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
        if ('stopPropagation' in event) {
            event.stopPropagation();
        }

        // Filter files to include only videos or .mts files
        const filteredFiles = acceptedFiles.filter(file =>
            file.type.startsWith('audio/')
        );

        if (!isModalUploadMusicOpen) {
            setIsModalUploadMusicOpen(true);
        }

        // Update file list with filtered files
        setFiles(prevFiles => [...prevFiles, ...filteredFiles]);

        // Update upload size based on filtered files
        setCurrentUploadSize(prevSize => prevSize + filteredFiles.reduce((acc, file) => acc + file.size, 0));

        // Start upload if not already in progress
        if (!uploading) {
            handleUploadNextFile(0, filteredFiles);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploading, folderid]);


    const handleUploadNextFile = async (index: number, fileQueue: File[]) => {
        if (index >= fileQueue.length) {
            getFilesAndFolders(folderid);
            handleAllFilesUploaded();
            return;
        }

        const file = fileQueue[index];
        setCurrentUploadFile([...currentUploadFile, file.name]);
        setUploading(true);
        const startTime = Date.now();
        const lastLoaded = 0;
        const lastTime = startTime;

        try {
            const formData = new FormData();
            formData.append('token', token);
            formData.append('folderid', folderid.toString());
            formData.append('file', file);
            const creationDate = moment(file.lastModified).format('YYYY-MM-DD HH:mm:ss');
            formData.append('created', creationDate);

            const response = await axios.post(APIURL + "/supradrive/music/upload", formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"), },
                onUploadProgress: (event) => {
                    if (event.total) {
                        const currentTime = Date.now();
                        const loaded = event.loaded;
                        setCurrentUploadedSize(loaded);

                        const deltaTime = (currentTime - lastTime) / 1000;
                        const deltaLoaded = loaded - lastLoaded;

                        const speed = Number(((deltaLoaded / (1024 * 1024)) / deltaTime).toFixed(2));

                        // const remainingBytes = event.total - event.loaded;
                        const remainingBytes = currentUploadSize - currentUploadedSize - event.loaded;
                        const remainingSeconds = remainingBytes / (deltaLoaded / deltaTime);

                        let timeRemaining = '';
                        if (remainingSeconds < 60) {
                            timeRemaining = `${Math.round(remainingSeconds)}s`;
                        } else if (remainingSeconds < 3600) {
                            timeRemaining = `${Math.round(remainingSeconds / 60)}m ${Math.round(remainingSeconds % 60)}s`;
                        } else {
                            const hours = Math.floor(remainingSeconds / 3600);
                            const minutes = Math.round((remainingSeconds % 3600) / 60);
                            timeRemaining = `${hours}h ${minutes}m`;
                        }
                        const progress = Math.round((event.loaded * 100) / event.total);

                        setUploadProgress(prevProgress => ({
                            ...prevProgress,
                            [file.name]: { progress, speed, timeRemaining }
                        }));
                    }
                },
            });
            let resdata: any;
            try {
                resdata = JSON.parse(response.data);
            } catch {
                resdata = response.data || "Response data is not a JSON";
            }

            if (resdata.code === 200 && resdata.status === "success") {
                console.log("[" + (index + 1) + " / " + fileQueue.length + "]: " + resdata.message + " (" + resdata.id + ")");
                setUploadProgress(prevProgress => ({
                    ...prevProgress,
                    [file.name]: { progress: 100, speed: 0, timeRemaining: "" }
                }));
            } else {
                console.log("[" + (index + 1) + " / " + fileQueue.length + "]: " + resdata.message + " (" + resdata.id + ")");
                setUploadProgress(prevProgress => ({
                    ...prevProgress,
                    [file.name]: { progress: 100, speed: 0, timeRemaining: "", error: resdata.message }
                }));
            }
        } catch (error: any) {
            let errorMessage: any;
            try {
                if (!isValidObject(error.response.data)) {
                    errorMessage = JSON.parse(error.response.data);
                    console.log("[" + (index + 1) + " / " + fileQueue.length + "]: ERROR: " + errorMessage?.message + " (" + errorMessage?.id + ")");
                }
                else {
                    console.log("[" + (index + 1) + " / " + fileQueue.length + "]: ERROR: " + error);
                }
            } catch {
                if (!isValidObject(error.response.data)) {
                    errorMessage = JSON.parse(error.response.data);
                    console.log("[" + (index + 1) + " / " + fileQueue.length + "]: Catch ERROR: " + errorMessage?.message + " (" + errorMessage?.id + ")");
                }
                else {
                    console.log("[" + (index + 1) + " / " + fileQueue.length + "]: Catch ERROR: " + error);
                }
            }
            setUploadProgress(prevProgress => ({
                ...prevProgress,
                [file.name]: { progress: 100, speed: 0, timeRemaining: "", error: errorMessage?.message }
            }));
        }
        handleUploadNextFile(index + 1, fileQueue);
    };

    const { getRootProps: getRootPropsMusic, getInputProps: getInputPropsMusic, isDragActive } = useDropzone({
        onDrop: onDropMusic,
        maxSize: MAX_FILE_SIZE,
        multiple: true,
        maxFiles: 1000,
    });


    const handleAllFilesUploaded = () => {
        // setUploading(false);
        // setFiles([]);
        // setIsModalUploadImagesOpen(false);
        // setUploadProgress({});
        setTimeout(() => {
            getFilesAndFolders(folderid);
        }, 1000);

        const successCount = Object.values(uploadProgress).filter((file: any) => file.progress === 100 && file.error === undefined).length;
        const errorCount = Object.values(uploadProgress).filter((file: any) => file.progress === 100 && file.error !== undefined).length;

        if (errorCount > 0) {
            setNotificationMessage("Total files: " + files.length + " Success: " + successCount + " Error: " + errorCount);
            setNotificationType("error");
            setShowNotification(true);
        }
        else {
            setNotificationMessage("Total files: " + files.length + " Success: " + successCount + " Error: " + errorCount);
            setNotificationType("success");
            setShowNotification(true);
            closeModalUploadMusic();
        }
    }

    type MenuItem = {
        label: string;
        action: () => void;
    };

    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        const target = event.target as HTMLElement;

        if (target.closest(".FileMenu")) {
            setMenuItems([
                { label: "View", action: () => alert("Open") },
                { label: "Download", action: () => alert("Download") },
                { label: "Delete", action: () => alert("Deleted") },
            ]);
        } else if (target.closest(".text-item")) {
            setMenuItems([
                { label: "Copy Text", action: () => alert("Text Copied") },
                { label: "Change Text", action: () => alert("Changing Text") },
            ]);
        } else {
            setMenuItems([{ label: "Refresh", action: () => window.location.reload() }]);
        }

        setMenuPosition({ x: event.clientX, y: event.clientY });
    };

    const handleClickOutside = () => setMenuPosition(null);

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleSelectFolder = (newfolderid: number, newfoldername: string | null = null) => {
        setUpFolderId(folderid);
        setFolderid(newfolderid);
        if (newfoldername) {
            setFoldername(newfoldername);
        }
        else {
            setFoldername("");
        }
        getFilesAndFolders(newfolderid);
    }

    const openModalNewFolder = () => {
        setIsModalNewFolderOpen(true);
    }
    const closeModalNewFolder = () => {
        setIsModalNewFolderOpen(false);
        setFolderName("");
    }

    const openModalUploadMusic = () => {
        setIsModalUploadMusicOpen(true);
    }
    const closeModalUploadMusic = () => {
        setUploading(false);
        setFiles([]);
        setUploadProgress({});
        getFilesAndFolders(folderid);
        setIsModalUploadMusicOpen(false);
        setCurrentUploadedSize(0);
        setCurrentUploadSize(0);
    }

    const getFilesAndFolders = async (folderiduse: number | undefined) => {
        const folderidext = folderiduse ?? folderid;
        axios.get(APIURL + "/supradrive/music/folder/" + folderidext, { withCredentials: true, headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"), 'Content-Type': 'application/json' } })
            .then(async (response) => {
                console.log(response.data);
                setMusicFolders(response.data[0]?.folders);
                setMusicFiles(response.data[0]?.files);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleViewMusic = (musicid: number) => {
        setMusic(musicid);
    }

    const handleMusicInfo = (musicid: number | boolean) => {
        if (typeof musicid === "number") {
            setCurrentMusicIndex(musicid);
            setDisplayMusicInfo(true);
        } else {
            setDisplayMusicInfo(false);
            setCurrentMusicIndex(0);
        }
    }

    const setNewFolderName = (foldername: string) => {
        foldername = foldername.replace(/[^a-zA-ZæøåÆØÅ0-9-_ .]/g, '');
        setFolderName(foldername);
    }

    const createNewFolder = async () => {
        const json = {
            foldersysid: 1,
            foldersubid: folderid,
            foldername: folderName,
        }
        const folderjson = JSON.stringify(json);
        await axios.post(APIURL + "/supradrive/music/folder", folderjson, { withCredentials: true, headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"), 'Content-Type': 'application/json' } })
            .then((response) => {
                const data = JSON.parse(response.data);
                if (data.status == "success") {
                    setNotificationMessage(data.message);
                    setNotificationType("success");
                    setShowNotification(true);
                }
                else {
                    setNotificationMessage(response.data.message);
                    setNotificationType("error");
                    setShowNotification(true);
                }
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
        setToken(sessionStorage.getItem("supradrivetoken") || "");
        setLoading(false);
        getFilesAndFolders(folderid);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
    }, [thumbSize]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMusic(0);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [setMusic]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsModalUploadMusicOpen(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [setIsModalUploadMusicOpen]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsModalNewFolderOpen(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [setIsModalNewFolderOpen]);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === "+") {
                setIsModalNewFolderOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyPress);
    }, []);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === "Insert") {
                setIsModalUploadMusicOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyPress);
    }, []);

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            if (document.activeElement === inputUserTagsRef.current) {
                setStartX(e.touches[0].clientX);
            }
            if (document.activeElement === inputHashtagsRef.current) {
                setStartX(e.touches[0].clientX);
            }
            if (document.activeElement === inputLocationRef.current) {
                setStartX(e.touches[0].clientX);
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            console.log(e);
        };

        document.addEventListener("touchstart", handleTouchStart);
        document.addEventListener("touchend", handleTouchEnd);

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [startX]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black">
                <LoadingScreen text="Checking authentication" />
            </div>
        );
    }

    return (
        <>
            {showNotification && (
                <Notification
                    type={notificationType}
                    message={notificationMessage}
                    duration={3000}
                    onClose={() => setShowNotification(false)}
                />
            )}
            {displayMusicInfo && (
                <Notification
                    type="info"
                    message={musicFiles[currentMusicIndex]?.musicfilename + " (" + formatBytes(musicFiles[currentMusicIndex]?.musicsize) + ") " + moment(musicFiles[currentMusicIndex]?.musicdate).format("DD.MM.YYYY") + " " + musicFiles[currentMusicIndex]?.musictime + "\n#" + musicFiles[currentMusicIndex]?.musichashtags.map((tag: any) => tag.hashtag).join(", #") + "\n@" + musicFiles[currentMusicIndex]?.musicousertags.map((tag: any) => tag.user).join(", @") + "\n!" + musicFiles[currentMusicIndex]?.musiclocationtags.map((tag: any) => tag.location).join(", !")}
                    onClose={() => setDisplayMusicInfo(false)}
                />
            )}
            <div className="min-h-screen bg-black text-gray-900 dark:text-gray-100">
                <nav className="p-4 bg-black">
                    <ol className="flex space-x-2">
                        <Link href="/"><li className="text-green-700">Home</li></Link>
                        <li className="before:content-['»'] before:pr-2 text-green-700">{username}</li>
                        <li className="before:content-['»'] before:pr-2 text-green-700">Music</li>
                        {folderid !== 0 && <li className="before:content-['»'] before:pr-2 text-green-700">{foldername}</li>}
                    </ol>
                </nav>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-8 pl-2">
                        <div className="text-xl text-green-700 flex items-center gap-2">
                            {foldername} ({musicFolders?.length} folders, {musicFiles?.length} files)
                        </div>
                        <div className="flex gap-4 pt-4">
                            {(folderid !== 0) && (
                                <>
                                    <button
                                        className="flex item-center gap-1 px-2 py-1 text-sm text-green-500 border border-2 border-green-900 rounded-lg bg-transparent hover:border-green-500"
                                        onClick={() => handleSelectFolder(0)}
                                    >
                                        <div className="flex flex-col items-center group">
                                            <svg
                                                width="28"
                                                height="28"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M14 5L8 12L14 19"
                                                    stroke="#E0A800"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M20 5L14 12L20 19"
                                                    stroke="#E0A800"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                    </button>

                                    <button
                                        className="flex item-center gap-1 px-2 py-1 text-sm text-green-500 border border-2 border-green-900 rounded-lg bg-transparent hover:border-green-500"
                                        onClick={() => handleSelectFolder(upFolderId)}
                                    >
                                        <div className="flex flex-col items-center group">
                                            <svg
                                                width="28"
                                                height="28"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M15 6L9 12L15 18"
                                                    stroke="#E0A800"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                    </button>
                                    <button
                                        className="flex item-center gap-1 px-2 py-1 text-sm text-green-500 border border-2 border-green-900 rounded-lg bg-transparent hover:border-green-500"
                                        onClick={openModalUploadMusic}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"></path>
                                            <polyline points="16 12 12 8 8 12"></polyline>
                                            <line x1="12" y1="8" x2="12" y2="20"></line>
                                        </svg>
                                    </button>
                                </>
                            )}
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
                            <button
                                className="flex item-center gap-1 px-2 py-1 text-sm text-green-500 border border-2 border-green-900 rounded-lg bg-transparent hover:border-green-500"
                                onClick={() => handleChangeThumbSize(null)}
                            >
                                <div className="flex flex-col items-center group">
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M12 4L6 10H18L12 4Z"
                                            stroke="#E0A800"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M12 20L6 14H18L12 20Z"
                                            stroke="#E0A800"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>


                <div className="mx-auto px-2">
                    <div className="rounded-lg bg-vc-border-gradient p-px shadow-lg shadow-black/20">
                        <div className="rounded-lg bg-black w-full pt-2">
                            <div className="prose prose-sm prose-invert max-w-none">
                                <div
                                    className={`flex flex-wrap items-center justify-start gap-2`}
                                >
                                    {musicFolders?.map((folder) => {
                                        if (folder.foldername) {
                                            return (
                                                <div key={folder.folderid} onClick={() => handleSelectFolder(folder.folderid, folder.foldername)}>
                                                    <div className="flex flex-col items-center group">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="yellow"
                                                            width={thumbSize}
                                                            height={thumbSize - 20}
                                                            viewBox="0 0 24 24"
                                                            className="hi-folder text-yellow-500 group-hover:text-yellow-400 transform group-hover:scale-110 transition duration-300"
                                                        >
                                                            <path d="M3 18V6a2 2 0 012-2h4.539a2 2 0 011.562.75L12.2 6.126a1 1 0 00.78.375H20a1 1 0 011 1V18a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
                                                        </svg>
                                                        <span className="text-white group-hover:text-gray-300 transition duration-300 text-center max-w-[12.5rem] break-words">
                                                            {folder.foldername}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                                <div>
                                    {musicFiles?.map((file, index) => {
                                        if (file.musicfilename) {
                                            return (
                                                <div key={index} onClick={() => file.musicid}>
                                                    <div className="FileMenu border-1 border-transparent hover:underline" onContextMenu={handleContextMenu}>
                                                        <p onClick={() => handleViewMusic(file.musicid)}>{file.musicfilename}</p>
                                                    </div>

                                                    {
                                                        menuPosition && (
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
                                                        )
                                                    }
                                                </div>
                                            );
                                        }
                                    })}

                                </div>

                                {
                                    isModalUploadMusicOpen && (
                                        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
                                            {!uploading && (
                                                <div
                                                    style={{ width: 500, height: 70 }}
                                                    {...getRootPropsMusic()}
                                                    className={`border-2 ${isDragActive ? 'border-green-500' : 'border-green-900'} rounded-md p-5 text-center cursor-pointer transition-colors duration-200`}
                                                >
                                                    <input {...getInputPropsMusic()} />
                                                    <div className="text-green-700">
                                                        {isDragActive ?
                                                            "Drop the files here ..." :
                                                            "Drag & drop some files here, or click to select files"}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="mt-4">
                                                {files
                                                    // .filter((file) => (uploadProgress[file.name]?.progress !== 100 || uploadProgress[file.name]?.error !== undefined))
                                                    .filter((file: any) => currentUploadFile.includes(file.name))
                                                    .map((file: any) => (
                                                        <div key={file.name} className="mb-2 mr-5 ml-5">
                                                            {!uploadProgress[file.name]?.error &&
                                                                <div
                                                                    className={`text-green-700 text-sm ${uploadProgress[file.name]?.error ? 'text-red-700' : 'text-green-700'
                                                                        }`}
                                                                    style={{ minWidth: '480px' }}
                                                                >
                                                                    {file.name} ({uploadProgress[file.name]?.progress || 0}%) &nbsp; ({formatBytes(file.size - currentUploadedSize)}) &nbsp; - &nbsp;
                                                                    {uploadProgress[file.name]?.speed > 0 &&
                                                                        `${uploadProgress[file.name]?.speed} MB/s (${uploadProgress[file.name]?.timeRemaining})`}
                                                                </div>
                                                            }
                                                            {uploadProgress[file.name]?.error ? (
                                                                <span className="text-red-700 text-xs">- {uploadProgress[file.name]?.error}</span>
                                                            ) : (
                                                                <div className="w-full h-2 bg-gray-700 rounded-full">
                                                                    <div
                                                                        className="h-full bg-green-500 rounded-full"
                                                                        style={{ width: `${uploadProgress[file.name]?.progress || 0}%` }}
                                                                    ></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                            <div className="flex flex items-center justify-center gap-4 mt-4">
                                                Total files: <span className="text-green-700 text-sm">{files.length}</span>
                                                Success: <span className="text-green-700 text-sm">{Object.values(uploadProgress).filter((file: any) => ((file.progress === 100) && (file.error === undefined))).length}</span>
                                                Error: <span className="text-red-700 text-sm">{Object.values(uploadProgress).filter((file: any) => ((file.progress === 100) && (file.error !== undefined))).length}</span>
                                            </div>
                                            <div className="flex flex items-center justify-center gap-4 mt-4">
                                                <button
                                                    className="mt-4 px-4 py-1 border border-red-900 text-red-700 rounded-lg hover:border-red-500 hover:text-red-500 focus:ring-2 focus:ring-red-500 flex items-center"
                                                    onClick={closeModalUploadMusic}
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
                                                    onChange={(e) => setNewFolderName(e.target.value)}
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
            {music && (
                <footer className="fixed bottom-0 left-0 w-full h-[100px]">
                    <MusicPlayer key={music} musicid={music} />
                </footer>
            )}
        </>
    );
}

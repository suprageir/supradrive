"use client";
import { useCallback, useEffect, useState } from "react";
import axios from 'axios';
import Link from "next/link";
import LoadingScreen from "@/app/components/LoadingScreen";
import { DropEvent, FileRejection, useDropzone } from 'react-dropzone';
import Image from "next/image";
import moment from "moment";
import Notification from "@/app/components/Notification";

const APIURL = process.env.NEXT_PUBLIC_APIURL;

interface UploadProgressType {
    [key: string]: {
        progress: number;
        speed: number;
        timeRemaining: string;
        error?: string;
    };
}


export default function Page() {
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState("");
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationType, setNotificationType] = useState<"success" | "error" | "warning" | "info">("success");
    const [username, setUsername] = useState("");
    // const [userid, setUserid] = useState("");
    const [imagesFolders, setImagesFolders] = useState<any[]>([]);
    const [imagesFiles, setImagesFiles] = useState<any[]>([]);
    const [isModalNewFolderOpen, setIsModalNewFolderOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [folderid, setFolderid] = useState(0);
    const [foldername, setFoldername] = useState("");
    const [upFolderId, setUpFolderId] = useState(0);
    const [uploadProgress, setUploadProgress] = useState<UploadProgressType>({});
    const [isModalUploadImagesOpen, setIsModalUploadImagesOpen] = useState(false);

    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);
    const [thumbSize, setThumbSize] = useState(100);
    const [image, setImage] = useState<any>(null);

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
            else {
                setThumbSize(100);
            }
        }
    }

    const onDropImages = useCallback((acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
        event.stopPropagation();
        setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);

        if (!uploading) {
            handleUploadNextFile(0, [...acceptedFiles]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploading, folderid]);

    const handleUploadNextFile = async (index: number, fileQueue: File[]) => {
        if (index >= fileQueue.length) {
            // setUploading(false);
            handleAllFilesUploaded();
            return;
        }

        const file = fileQueue[index];
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

            const response = await axios.post(APIURL + "/supradrive/images/upload", formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"), },
                onUploadProgress: (event) => {
                    if (event.total) {
                        const currentTime = Date.now();
                        const loaded = event.loaded;
                        const deltaTime = (currentTime - lastTime) / 1000;
                        const deltaLoaded = loaded - lastLoaded;

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
            if (response.status === 200 && response.data.status === "success") {
                setUploadProgress(prevProgress => ({
                    ...prevProgress,
                    [file.name]: { progress: 100, speed: 0, timeRemaining: "" }
                }));
                handleUploadNextFile(index + 1, fileQueue);
            } else {
                setUploadProgress(prevProgress => ({
                    ...prevProgress,
                    [file.name]: { progress: 100, speed: 0, timeRemaining: "", error: response.data.message }
                }));
            }
            handleUploadNextFile(index + 1, fileQueue);
        } catch (error: any) {
            const errorMessage = JSON.parse(JSON.stringify(error.response.data));
            setUploadProgress(prevProgress => ({
                ...prevProgress,
                [file.name]: { progress: 100, speed: 0, timeRemaining: "", error: errorMessage.message }
            }));
            handleUploadNextFile(index + 1, fileQueue);
        }
    };

    const { getRootProps: getRootPropsImages, getInputProps: getInputPropsImages, isDragActive } = useDropzone({
        onDrop: onDropImages,
        multiple: true,
        accept: {
            'image/*': []
        },
        maxFiles: 1000,
    });


    const handleAllFilesUploaded = () => {
        // setUploading(false);
        // setFiles([]);
        // setIsModalUploadImagesOpen(false);
        // setUploadProgress({});
        // getFilesAndFolders(folderid);
    }

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

    const openModalUploadImages = () => {
        setIsModalUploadImagesOpen(true);
    }
    const closeModalUploadImages = () => {
        setUploading(false);
        setFiles([]);
        setUploadProgress({});
        getFilesAndFolders(folderid);
        setIsModalUploadImagesOpen(false);
    }

    const getFilesAndFolders = async (folderiduse: number | undefined) => {
        const folderidext = folderiduse ?? folderid;
        axios.get(APIURL + "/supradrive/images/folder/" + folderidext, { withCredentials: true, headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"), 'Content-Type': 'application/json' } })
            .then(async (response) => {
                setImagesFolders(response.data[0]?.folders);
                setImagesFiles(response.data[0]?.files);
            })
            .catch((error) => {
                console.log(error);
            });
    };


    const handleViewImage = (imageid: number) => {
        axios.get(APIURL + "/supradrive/image/" + imageid, { withCredentials: true, headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"), 'Content-Type': 'application/json' } })
            .then(async (response) => {
                setImage(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const createNewFolder = async () => {
        const json = {
            foldersysid: 1,
            foldersubid: folderid,
            foldername: folderName,
        }
        const folderjson = JSON.stringify(json);
        await axios.post(APIURL + "/supradrive/images/folder", folderjson, { withCredentials: true, headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem("supradrivetoken"), 'Content-Type': 'application/json' } })
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
        // setUserid(sessionStorage.getItem("supradriveuserid") || "");
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
                setImage(null);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [setImage]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsModalUploadImagesOpen(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [setIsModalUploadImagesOpen]);

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


    if (image) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90"
                onClick={() => setImage(null)}
            >
                <Image
                    src={image.base64Image}
                    alt={image.imagefilename || "n/a"}
                    layout="intrinsic"
                    width={image.imagewidth || 1024}
                    height={image.imageheight || 1024}
                    style={{
                        maxWidth: "100vw",
                        maxHeight: "100vh",
                        objectFit: "contain"
                    }}
                />
            </div>
        );
    }

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
            <div className="min-h-screen bg-black text-gray-900 dark:text-gray-100">
                <nav className="p-4 bg-black">
                    <ol className="flex space-x-2">
                        <Link href="/"><li className="text-green-700">Home</li></Link>
                        <li className="before:content-['»'] before:pr-2 text-green-700">{username}</li>
                        <li className="before:content-['»'] before:pr-2 text-green-700">Images</li>
                        {folderid !== 0 && <li className="before:content-['»'] before:pr-2 text-green-700">{foldername}</li>}
                    </ol>
                </nav>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-8 pl-2">
                        <div className="text-xl text-green-700 flex items-center gap-2">
                            {foldername} ({imagesFolders.length} folders, {imagesFiles.length} images)
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
                                        onClick={openModalUploadImages}
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
                                <div className="flex flex-wrap items-center justify-start gap-2">
                                    {imagesFolders?.map((folder) => {
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
                                    {imagesFiles?.map((file) => {
                                        if (file.imagefilename) {
                                            return (
                                                <div key={file.imageid} onClick={() => (file.imageid)}>
                                                    <div className="FileMenu flex flex-col items-center group" onContextMenu={handleContextMenu}>
                                                        <div>
                                                            {file.base64Thumbnail ? (
                                                                <Image
                                                                    src={file.base64Thumbnail}
                                                                    alt={file.imagefilename}
                                                                    width={thumbSize}
                                                                    height={thumbSize}
                                                                    onClick={() => handleViewImage(file.imageid)}
                                                                />
                                                            ) : (
                                                                <p>[N/A]</p>
                                                            )}
                                                        </div>
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

                                {isModalUploadImagesOpen && (
                                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
                                        {!uploading && (
                                            <div
                                                style={{ width: 500, height: 70 }}
                                                {...getRootPropsImages()}
                                                className={`border-2 ${isDragActive ? 'border-green-500' : 'border-green-900'} rounded-md p-5 text-center cursor-pointer transition-colors duration-200`}
                                            >
                                                <input {...getInputPropsImages()} />
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
                                                    <div className={`text-green-700 text-sm ${uploadProgress[file.name]?.error ? 'text-red-700' : 'text-green-700'}`}>
                                                        {file.name} ({uploadProgress[file.name]?.progress || 0}%)
                                                        {uploadProgress[file.name]?.speed > 0 &&
                                                            ` - ${uploadProgress[file.name]?.speed} MB/s (${uploadProgress[file.name]?.timeRemaining})`
                                                        }
                                                    </div>
                                                    {uploadProgress[file.name]?.error ?
                                                        <span className="text-red-700 text-xs">- {uploadProgress[file.name]?.error}</span>
                                                        :
                                                        <div className="w-full h-2 bg-gray-700 rounded-full">
                                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${uploadProgress[file.name]?.progress || 0}%` }}></div>
                                                        </div>
                                                    }
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex items-center justify-center gap-4 mt-4">
                                            <button
                                                className="mt-4 px-4 py-1 border border-red-900 text-red-700 rounded-lg hover:border-red-500 hover:text-red-500 focus:ring-2 focus:ring-red-500 flex items-center"
                                                onClick={closeModalUploadImages}
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

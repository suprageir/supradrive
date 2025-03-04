"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const APIURL = process.env.NEXT_PUBLIC_APIURL;

export default function VideoPlayer({ videoid }: { videoid: number }) {
    const [videoSrc, setVideoSrc] = useState<string | null>(null);

    useEffect(() => {
        const fetchVideo = async () => {
            if (!sessionStorage.getItem("supradrivetoken")) {
                console.error("No token available");
                return;
            }

            const videoUrl = APIURL + "/supradrive/video/" + videoid;

            try {
                const response = await axios.get(videoUrl, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("supradrivetoken")}`,
                    },
                    responseType: "blob", // Important for streaming
                });

                const videoBlob = new Blob([response.data], { type: "video/mp4" });
                const videoObjectUrl = URL.createObjectURL(videoBlob);
                setVideoSrc(videoObjectUrl);
            } catch (error) {
                console.error("Error fetching video:", error);
            }
        };

        fetchVideo();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-2xl font-bold mb-4">Secure Video Streaming with Axios</h1>
            {videoSrc ? (
                <video
                    className="w-full max-w-3xl rounded-lg shadow-lg"
                    controls
                >
                    <source src={videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            ) : (
                <p>Loading video...</p>
            )}
        </div>
    );
}
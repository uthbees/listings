import { YoutubePlaylistItem } from 'youtube.ts';
import Image from 'next/image';
import { useState } from 'react';

interface CardProps {
    video: YoutubePlaylistItem;
    removeVideo: () => void;
}

export default function VideoCard({ video, removeVideo }: CardProps) {
    const [hidden, setHidden] = useState(false);

    const videoID = video.snippet.resourceId.videoId;
    const thumbnailURL = video.snippet.thumbnails.medium
        ? video.snippet.thumbnails.medium.url
        : 'https://img.youtube.com/vi/L9PraoV-BPo/mqdefault.jpg';
    const datePublished = new Date(
        video.snippet.publishedAt,
    ).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div
            id={`video_${videoID}`}
            className="videoContainer"
            style={{ display: hidden ? 'none' : undefined }}
        >
            <div className="thumbnailContainer">
                <a
                    href={`https://youtube.com/watch?v=${videoID}`}
                    className="thumbnailLink"
                >
                    <Image
                        src={thumbnailURL}
                        alt={video.snippet.title}
                        width={320}
                        height={180}
                    />
                </a>
            </div>
            <p className="textLine">{video.snippet.title}</p>
            <p className="textLine">{video.snippet.channelTitle}</p>
            <p className="textLine">{datePublished}</p>
            <div
                className="button doneButton"
                onClick={() => {
                    setHidden(true);
                    removeVideo();
                }}
            >
                Done
            </div>
        </div>
    );
}

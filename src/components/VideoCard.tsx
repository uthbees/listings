import Image from 'next/image';
import { useState } from 'react';
import { FetchedVideo } from '@/types';
import { Tooltip } from '@mui/material';

interface CardProps {
    video: FetchedVideo;
    removeVideo: () => void;
}

export default function VideoCard({ video, removeVideo }: CardProps) {
    const [hidden, setHidden] = useState(false);

    const datePublished = video.publishedAt.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div
            id={`video_${video.videoId}`}
            className="videoContainer"
            style={{ display: hidden ? 'none' : undefined }}
        >
            <div className="thumbnailContainer">
                <a
                    href={`https://youtube.com/watch?v=${video.videoId}`}
                    className="thumbnailLink"
                >
                    <Image
                        src={video.thumbnail}
                        alt={video.videoTitle}
                        width={320}
                        height={180}
                    />
                </a>
            </div>
            <Tooltip title={video.videoTitle}>
                <p className="textLine">{video.videoTitle}</p>
            </Tooltip>
            <p className="textLine">{video.channelTitle}</p>
            <p className="textLine">{datePublished}</p>
            {video.requestSourceType === 'playlist' ? (
                <div
                    className="button doneButton"
                    onClick={() => {
                        setHidden(true);
                        removeVideo();
                    }}
                >
                    Done
                </div>
            ) : null}
        </div>
    );
}

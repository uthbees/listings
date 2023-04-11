import Image from 'next/image';
import { useState } from 'react';
import { NormalizedVideoData } from '@/types';

interface CardProps {
    video: NormalizedVideoData;
    removeVideo: () => void;
}

export default function VideoCard({ video, removeVideo }: CardProps) {
    const [hidden, setHidden] = useState(false);

    const datePublished = new Date(video.publishedAt).toLocaleDateString(
        'en-US',
        {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        },
    );

    return (
        <div
            id={`video_${video.videoID}`}
            className="videoContainer"
            style={{ display: hidden ? 'none' : undefined }}
        >
            <div className="thumbnailContainer">
                <a
                    href={`https://youtube.com/watch?v=${video.videoID}`}
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
            <p className="textLine">{video.videoTitle}</p>
            <p className="textLine">{video.channelTitle}</p>
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

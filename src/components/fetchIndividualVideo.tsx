import Youtube from 'youtube.ts';
import { APIKey } from '@/config/APIKey';
import { VideoRequest } from '@/types';

export default function fetchIndividualVideo(request: VideoRequest) {
    const youtube = new Youtube(APIKey);

    return youtube.videos.get(request.id, { part: 'snippet' });
}

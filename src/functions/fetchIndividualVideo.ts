import Youtube from 'youtube.ts';
import { APIKey } from '@/config/APIKey';

import { ConfigVideoRequest } from '@/types/appConfig';

export default function fetchIndividualVideo(request: ConfigVideoRequest) {
    const youtube = new Youtube(APIKey);

    return youtube.videos.get(request.id, { part: 'snippet' });
}

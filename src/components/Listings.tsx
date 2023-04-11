import { Playlist } from '@/types';

interface ListingsProps {
    playlists: Playlist[];
}

export default function Listings({ playlists }: ListingsProps) {
    console.log('playlists', playlists);
    return <div>test</div>;
}

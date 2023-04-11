interface NoVideosMessageProps {
    stillLoading: boolean;
}

export default function NoVideosMessage({
    stillLoading,
}: NoVideosMessageProps) {
    return (
        <div className="centerInPage">
            {stillLoading ? 'Loading...' : 'Nothing here!'}
        </div>
    );
}

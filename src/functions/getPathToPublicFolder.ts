const isProd = process.env.NODE_ENV === 'production';

export default function getPathToPublicFolder(pathFromPublic: string) {
    return isProd ? `./${pathFromPublic}` : `/${pathFromPublic}`;
}

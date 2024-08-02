export default function isAnObject(potentialObject: unknown): potentialObject is object {
    return typeof potentialObject === 'object' && potentialObject !== null;
}

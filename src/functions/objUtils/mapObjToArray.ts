export default function mapObjToArray<T extends object, R>(
    object: T,
    callback: (item: T[keyof T], key: keyof T) => R,
): R[] {
    return Object.entries(object).map(([key, value]) =>
        callback(value as T[keyof T], key as keyof T),
    );
}

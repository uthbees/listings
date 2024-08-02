// Maps an array to an object. The callback should return a key-value pair in the form of an array with two items.
export default function mapArrayToObj<I, O, K extends string | number | symbol>(
    array: I[],
    callback: (item: I, index: number) => [K, O],
): Record<K, O> {
    return array.reduce<Record<K, O>>((acc, currentValue, index) => {
        const mapResult = callback(currentValue, index);

        return { ...acc, [mapResult[0]]: mapResult[1] };
    }, {} as Record<K, O>);
}

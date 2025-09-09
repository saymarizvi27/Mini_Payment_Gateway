export class LruCache<V> {
	private map = new Map<string, V>();
	constructor(private capacity: number) {}

	get(key: string): V | undefined {
		const val = this.map.get(key);
		if (val === undefined) return undefined;
		this.map.delete(key);
		this.map.set(key, val);
		return val;
	}

	set(key: string, value: V) {
		if (this.map.has(key)) this.map.delete(key);
		this.map.set(key, value);
		if (this.map.size > this.capacity) {
			const firstKey = this.map.keys().next().value as string;
			this.map.delete(firstKey);
		}
	}
}


// Pure in-memory cache with TTL using Map
const memoryStore = new Map<string, { value: unknown; expiresAt: number }>();

export const getCache = async <T>(key: string): Promise<T | null> => {
	const item = memoryStore.get(key);
	if (!item) return null;
	if (item.expiresAt <= Date.now()) {
		memoryStore.delete(key);
		return null;
	}
	return item.value as T;
};

export const setCache = async (key: string, value: unknown, ttlSeconds: number): Promise<void> => {
	memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
};

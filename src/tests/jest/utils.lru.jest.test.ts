import { LruCache } from '../../utils/lru';

describe('LruCache', () => {
  it('evicts least recently used item when capacity exceeded', () => {
    const lru = new LruCache<number>(2);
    lru.set('a', 1);
    lru.set('b', 2);
    expect(lru.get('a')).toBe(1); // a becomes most recent
    lru.set('c', 3); // evicts b
    expect(lru.get('b')).toBeUndefined();
    expect(lru.get('a')).toBe(1);
    expect(lru.get('c')).toBe(3);
  });

  it('updates existing key without increasing size', () => {
    const lru = new LruCache<number>(2);
    lru.set('a', 1);
    lru.set('a', 2);
    expect(lru.get('a')).toBe(2);
  });
});



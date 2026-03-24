import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageAuthProvider } from '../../providers/auth/LocalStorageAuthProvider';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  });
});

describe('LocalStorageAuthProvider', () => {
  it('returns null for getCurrentUser initially', () => {
    const provider = new LocalStorageAuthProvider();
    expect(provider.getCurrentUser()).toBeNull();
  });

  it('register creates user and sets as current', async () => {
    const provider = new LocalStorageAuthProvider();
    const user = await provider.register('alice', 'password123');
    expect(user.username).toBe('alice');
    expect(user.displayName).toBe('alice');
    expect(user.id).toBeTruthy();
    expect(provider.getCurrentUser()?.username).toBe('alice');
  });

  it('register with displayName stores it', async () => {
    const provider = new LocalStorageAuthProvider();
    const user = await provider.register('alice', 'pass', 'Alice W');
    expect(user.displayName).toBe('Alice W');
  });

  it('register throws if username already taken', async () => {
    const provider = new LocalStorageAuthProvider();
    await provider.register('alice', 'password123');
    await expect(provider.register('alice', 'other')).rejects.toThrow('Username already taken');
  });

  it('login returns user after registration', async () => {
    const provider = new LocalStorageAuthProvider();
    await provider.register('alice', 'password123');
    await provider.logout();
    const user = await provider.login('alice', 'password123');
    expect(user.username).toBe('alice');
  });

  it('login throws if user not found', async () => {
    const provider = new LocalStorageAuthProvider();
    await expect(provider.login('unknown', 'pass')).rejects.toThrow('User not found');
  });

  it('login throws with wrong password', async () => {
    const provider = new LocalStorageAuthProvider();
    await provider.register('alice', 'password123');
    await provider.logout();
    await expect(provider.login('alice', 'wrongpass')).rejects.toThrow('Invalid password');
  });

  it('login succeeds with correct password', async () => {
    const provider = new LocalStorageAuthProvider();
    await provider.register('alice', 'password123');
    await provider.logout();
    const user = await provider.login('alice', 'password123');
    expect(user.username).toBe('alice');
  });

  it('returned user does not contain passwordHash', async () => {
    const provider = new LocalStorageAuthProvider();
    const registered = await provider.register('alice', 'password123');
    expect((registered as unknown as Record<string, unknown>)['passwordHash']).toBeUndefined();

    await provider.logout();
    const loggedIn = await provider.login('alice', 'password123');
    expect((loggedIn as unknown as Record<string, unknown>)['passwordHash']).toBeUndefined();
  });

  it('getCurrentUser returns user after login', async () => {
    const provider = new LocalStorageAuthProvider();
    await provider.register('alice', 'password123');
    await provider.logout();
    await provider.login('alice', 'password123');
    const user = provider.getCurrentUser();
    expect(user).not.toBeNull();
    expect(user!.username).toBe('alice');
  });

  it('logout clears user', async () => {
    const provider = new LocalStorageAuthProvider();
    await provider.register('alice', 'password123');
    await provider.logout();
    expect(provider.getCurrentUser()).toBeNull();
  });

  it('onAuthChange fires on register', async () => {
    const provider = new LocalStorageAuthProvider();
    const callback = vi.fn();
    provider.onAuthChange(callback);

    await provider.register('alice', 'password123');
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({ username: 'alice' }));
  });

  it('onAuthChange fires on login', async () => {
    const provider = new LocalStorageAuthProvider();
    await provider.register('alice', 'password123');

    const callback = vi.fn();
    provider.onAuthChange(callback);

    await provider.logout();
    await provider.login('alice', 'password123');
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({ username: 'alice' }));
  });

  it('onAuthChange fires on logout', async () => {
    const provider = new LocalStorageAuthProvider();
    const callback = vi.fn();
    await provider.register('alice', 'password123');

    provider.onAuthChange(callback);
    await provider.logout();
    expect(callback).toHaveBeenCalledWith(null);
  });

  it('unsubscribe stops notifications', async () => {
    const provider = new LocalStorageAuthProvider();
    const callback = vi.fn();
    const unsubscribe = provider.onAuthChange(callback);

    unsubscribe();
    await provider.register('alice', 'password123');
    expect(callback).not.toHaveBeenCalled();
  });

  it('login with same username returns consistent id', async () => {
    const provider = new LocalStorageAuthProvider();
    const user1 = await provider.register('bob', 'pass1');
    await provider.logout();
    const user2 = await provider.login('bob', 'pass1');
    expect(user1.id).toBe(user2.id);
  });
});

import { describe, it, expect } from 'vitest';
import { formatTime, formatDuration, formatRelativeDate } from '../../utils/formatTime';

describe('formatTime', () => {
  it('formats seconds as M:SS', () => {
    expect(formatTime(187)).toBe('3:07');
  });

  it('handles exact minutes', () => {
    expect(formatTime(120)).toBe('2:00');
  });

  it('handles sub-minute durations', () => {
    expect(formatTime(45)).toBe('0:45');
  });

  it('handles large durations', () => {
    expect(formatTime(3661)).toBe('61:01');
  });

  it('returns dash for zero', () => {
    expect(formatTime(0)).toBe('—');
  });

  it('returns dash for negative values', () => {
    expect(formatTime(-5)).toBe('—');
  });

  it('floors fractional seconds', () => {
    expect(formatTime(65.9)).toBe('1:05');
  });
});

describe('formatDuration', () => {
  it('formats seconds as Xh Ym', () => {
    expect(formatDuration(5400)).toBe('1h 30m');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0h 0m');
  });

  it('handles negative', () => {
    expect(formatDuration(-100)).toBe('0h 0m');
  });

  it('handles minutes only', () => {
    expect(formatDuration(150)).toBe('0h 2m');
  });

  it('handles hours only', () => {
    expect(formatDuration(7200)).toBe('2h 0m');
  });
});

describe('formatRelativeDate', () => {
  it('returns "Just now" for recent timestamps', () => {
    const now = new Date().toISOString();
    expect(formatRelativeDate(now)).toBe('Just now');
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeDate(fiveMinAgo)).toBe('5 minutes ago');
  });

  it('returns singular minute', () => {
    const oneMinAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString();
    expect(formatRelativeDate(oneMinAgo)).toBe('1 minute ago');
  });

  it('returns hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeDate(twoHoursAgo)).toBe('2 hours ago');
  });

  it('returns singular hour', () => {
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeDate(oneHourAgo)).toBe('1 hour ago');
  });

  it('returns "Yesterday"', () => {
    const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeDate(yesterday)).toBe('Yesterday');
  });

  it('returns "X days ago" for recent days', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeDate(threeDaysAgo)).toBe('3 days ago');
  });

  it('returns formatted date for older timestamps', () => {
    const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeDate(oldDate);
    // Should contain month abbreviation and day number
    expect(result).toMatch(/\w+ \d+/);
  });
});

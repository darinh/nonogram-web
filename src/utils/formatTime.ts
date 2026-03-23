/**
 * Format elapsed seconds as M:SS (e.g., 3:07).
 * Returns "—" for zero or negative values.
 */
export function formatTime(seconds: number): string {
  if (seconds <= 0) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format elapsed seconds as a longer duration string.
 * Examples: "0h 2m", "1h 30m", "0h 0m"
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0h 0m';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

/**
 * Format an ISO date string as a relative time description.
 * Examples: "Just now", "5 minutes ago", "2 hours ago", "Yesterday", "3 days ago", "Jan 15"
 */
export function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

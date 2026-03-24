import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/UserMenu.module.css';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!user) return null;

  const initial = (user.displayName || user.username).charAt(0);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={styles.avatar}
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        aria-expanded={open}
      >
        {initial}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.displayName}>{user.displayName || user.username}</div>
          <button
            className={styles.signOutButton}
            onClick={async () => {
              setOpen(false);
              await logout();
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

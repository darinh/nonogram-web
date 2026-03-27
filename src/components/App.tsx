import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { PuzzleProviderContext, ProgressProviderContext, ThemeProviderContext, WalletProviderContext, SoundProviderContext, AuthProviderContext } from '../providers/ProviderContext';
import { WebAudioSoundProvider } from '../providers/sound';
import { useAuth } from '../hooks/useAuth';
import { CompositePuzzleProvider } from '../providers/puzzle/CompositePuzzleProvider';
import { StaticPuzzleProvider } from '../providers/puzzle/StaticPuzzleProvider';
import { LocalStoragePuzzleProvider } from '../providers/puzzle/LocalStoragePuzzleProvider';
import { DailyPuzzleProvider } from '../providers/puzzle/DailyPuzzleProvider';
import { LocalStorageProgressProvider } from '../providers/progress/LocalStorageProgressProvider';
import { StaticThemeProvider } from '../providers/theme';
import { LocalStorageWalletProvider } from '../providers/wallet';
import { LocalStorageAuthProvider } from '../providers/auth/LocalStorageAuthProvider';
import { FirebaseAuthProvider } from '../providers/auth/FirebaseAuthProvider';
import { isConfigured } from '../firebase';
import type { AuthProvider } from '../providers/auth/AuthProvider';
import HomePage from './HomePage';
import PuzzleBrowser from './PuzzleBrowser';
import GamePage from './GamePage';
import CreatorPage from './CreatorPage';
import StatsPage from './StatsPage';
import ProfilePage from './ProfilePage';
import HowToPlayPage from './HowToPlayPage';
import DailyPuzzlePage from './DailyPuzzlePage';
import LoginPage from './LoginPage';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import TermsPage from './TermsPage';
import UserMenu from './UserMenu';
import ThemeBrowserPage from './ThemeBrowserPage';
import ThemeGridPage from './ThemeGridPage';
import { CoinDisplay } from './CoinDisplay';
import { Footer } from './Layout';
import ThemeToggle from './ThemeToggle';
import { WalletStateProvider } from '../providers/wallet/WalletContext';
import styles from '../styles/App.module.css';
import '../styles/global.css';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

export default function App() {
  const puzzleProvider = useMemo(
    () => new CompositePuzzleProvider([new StaticPuzzleProvider(), new DailyPuzzleProvider(), new LocalStoragePuzzleProvider()]),
    [],
  );
  const themeProvider = useMemo(() => new StaticThemeProvider(), []);
  const soundProvider = useMemo(() => new WebAudioSoundProvider(), []);
  const authProvider = useMemo<AuthProvider>(
    () => isConfigured ? new FirebaseAuthProvider() : new LocalStorageAuthProvider(),
    [],
  );

  return (
    <AuthProviderContext.Provider value={authProvider}>
    <SoundProviderContext.Provider value={soundProvider}>
    <PuzzleProviderContext.Provider value={puzzleProvider}>
      <ThemeProviderContext.Provider value={themeProvider}>
        <AuthSwitchedProviders>
          <BrowserRouter>
            <div className={styles.app}>
              <SiteNav />
              <main className={styles.content}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/puzzles" element={<PuzzleBrowser />} />
                  <Route path="/themes" element={<ThemeBrowserPage />} />
                  <Route path="/themes/:themeId" element={<ThemeGridPage />} />
                  <Route path="/themes/:themeId/:puzzleId" element={<GamePage />} />
                  <Route path="/daily" element={<DailyPuzzlePage />} />
                  <Route path="/play/:puzzleId" element={<GamePage />} />
                  <Route path="/create" element={<CreatorPage />} />
                  <Route path="/stats" element={<StatsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/howtoplay" element={<HowToPlayPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </AuthSwitchedProviders>
      </ThemeProviderContext.Provider>
    </PuzzleProviderContext.Provider>
    </SoundProviderContext.Provider>
    </AuthProviderContext.Provider>
  );
}

function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen, closeMenu]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

  return (
    <nav className={styles.nav}>
      <NavLink to="/" className={styles.logo} onClick={closeMenu}>
        <span className={styles.logoDot} />
        Nonogram
      </NavLink>

      <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
        <NavLink to="/puzzles" className={linkClass} onClick={closeMenu}>Puzzles</NavLink>
        <NavLink to="/themes" className={linkClass} onClick={closeMenu}>Themes</NavLink>
        <NavLink to="/daily" className={linkClass} onClick={closeMenu}>Daily</NavLink>
        <NavLink to="/create" className={linkClass} onClick={closeMenu}>Create</NavLink>
        <NavLink to="/stats" className={linkClass} onClick={closeMenu}>Stats</NavLink>
        <NavLink to="/profile" className={linkClass} onClick={closeMenu}>Profile</NavLink>
        <NavLink to="/howtoplay" className={linkClass} onClick={closeMenu}>How to Play</NavLink>
      </div>

      <div className={styles.navRight}>
        <CoinDisplay />
        <NavAuth closeMenu={closeMenu} />
        <ThemeToggle />
      </div>

      <button
        className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
        onClick={toggleMenu}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        <span className={styles.hamburgerBar} />
        <span className={styles.hamburgerBar} />
        <span className={styles.hamburgerBar} />
      </button>

      <div
        className={`${styles.mobileOverlay} ${menuOpen ? styles.mobileOverlayVisible : ''}`}
        onClick={closeMenu}
        role="presentation"
      />
    </nav>
  );
}

function NavAuth({ closeMenu }: { closeMenu: () => void }) {
  const { user } = useAuth();
  if (user) return <UserMenu />;
  return <NavLink to="/login" className={styles.navLink} onClick={closeMenu}>Login</NavLink>;
}

/** Switches progress and wallet providers based on auth state. */
function AuthSwitchedProviders({ children }: { children: ReactNode }) {
  // Firebase providers disabled — using localStorage only
  // When Firebase is configured, swap to FirestoreProgressProvider/FirestoreWalletProvider here

  const progressProvider = useMemo(
    () => new LocalStorageProgressProvider(),
    [],
  );

  const walletProvider = useMemo(
    () => new LocalStorageWalletProvider(),
    [],
  );

  return (
    <ProgressProviderContext.Provider value={progressProvider}>
      <WalletProviderContext.Provider value={walletProvider}>
        <WalletStateProvider>
          {children}
        </WalletStateProvider>
      </WalletProviderContext.Provider>
    </ProgressProviderContext.Provider>
  );
}

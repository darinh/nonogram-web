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
import HomePage from './HomePage';
import PuzzleBrowser from './PuzzleBrowser';
import GamePage from './GamePage';
import CreatorPage from './CreatorPage';
import StatsPage from './StatsPage';
import DailyPuzzlePage from './DailyPuzzlePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import UserMenu from './UserMenu';
import ThemeBrowserPage from './ThemeBrowserPage';
import ThemeGridPage from './ThemeGridPage';
import { CoinDisplay } from './CoinDisplay';
import ThemeToggle from './ThemeToggle';
import { WalletStateProvider } from '../providers/wallet/WalletContext';
import styles from '../styles/App.module.css';
import '../styles/global.css';
import { useMemo, type ReactNode } from 'react';

export default function App() {
  const puzzleProvider = useMemo(
    () => new CompositePuzzleProvider([new StaticPuzzleProvider(), new DailyPuzzleProvider(), new LocalStoragePuzzleProvider()]),
    [],
  );
  const themeProvider = useMemo(() => new StaticThemeProvider(), []);
  const soundProvider = useMemo(() => new WebAudioSoundProvider(), []);
  const authProvider = useMemo(() => new LocalStorageAuthProvider(), []);

  return (
    <AuthProviderContext.Provider value={authProvider}>
    <SoundProviderContext.Provider value={soundProvider}>
    <PuzzleProviderContext.Provider value={puzzleProvider}>
      <ThemeProviderContext.Provider value={themeProvider}>
        <AuthSwitchedProviders>
          <BrowserRouter>
            <div className={styles.app}>
              <nav className={styles.nav}>
                <NavLink to="/" className={styles.logo}>
                  Nonogram
                </NavLink>
                <div className={styles.navLinks}>
                  <NavLink
                    to="/puzzles"
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                    }
                  >
                    Puzzles
                  </NavLink>
                  <NavLink
                    to="/themes"
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                    }
                  >
                    Themes
                  </NavLink>
                  <NavLink
                    to="/daily"
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                    }
                  >
                    Daily
                  </NavLink>
                  <NavLink
                    to="/create"
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                    }
                  >
                    Create
                  </NavLink>
                  <NavLink
                    to="/stats"
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                    }
                  >
                    📊 Stats
                  </NavLink>
                </div>
                <CoinDisplay />
                <NavAuth />
                <ThemeToggle />
              </nav>
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
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </AuthSwitchedProviders>
      </ThemeProviderContext.Provider>
    </PuzzleProviderContext.Provider>
    </SoundProviderContext.Provider>
    </AuthProviderContext.Provider>
  );
}

function NavAuth() {
  const { user } = useAuth();
  if (user) return <UserMenu />;
  return <NavLink to="/login" className={styles.navLink}>Login</NavLink>;
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

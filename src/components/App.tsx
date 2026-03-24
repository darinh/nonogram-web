import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { PuzzleProviderContext, ProgressProviderContext, ThemeProviderContext, WalletProviderContext } from '../providers/ProviderContext';
import { CompositePuzzleProvider } from '../providers/puzzle/CompositePuzzleProvider';
import { StaticPuzzleProvider } from '../providers/puzzle/StaticPuzzleProvider';
import { LocalStoragePuzzleProvider } from '../providers/puzzle/LocalStoragePuzzleProvider';
import { LocalStorageProgressProvider } from '../providers/progress/LocalStorageProgressProvider';
import { StaticThemeProvider } from '../providers/theme';
import { LocalStorageWalletProvider } from '../providers/wallet';
import HomePage from './HomePage';
import PuzzleBrowser from './PuzzleBrowser';
import GamePage from './GamePage';
import CreatorPage from './CreatorPage';
import StatsPage from './StatsPage';
import ThemeBrowserPage from './ThemeBrowserPage';
import ThemeGridPage from './ThemeGridPage';
import { CoinDisplay } from './CoinDisplay';
import ThemeToggle from './ThemeToggle';
import styles from '../styles/App.module.css';
import '../styles/global.css';
import { useMemo } from 'react';

export default function App() {
  const puzzleProvider = useMemo(
    () => new CompositePuzzleProvider([new StaticPuzzleProvider(), new LocalStoragePuzzleProvider()]),
    [],
  );
  const progressProvider = useMemo(() => new LocalStorageProgressProvider(), []);
  const themeProvider = useMemo(() => new StaticThemeProvider(), []);
  const walletProvider = useMemo(() => new LocalStorageWalletProvider(), []);

  return (
    <PuzzleProviderContext.Provider value={puzzleProvider}>
      <ProgressProviderContext.Provider value={progressProvider}>
        <ThemeProviderContext.Provider value={themeProvider}>
          <WalletProviderContext.Provider value={walletProvider}>
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
                  <ThemeToggle />
                </nav>
                <main className={styles.content}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/puzzles" element={<PuzzleBrowser />} />
                    <Route path="/themes" element={<ThemeBrowserPage />} />
                    <Route path="/themes/:themeId" element={<ThemeGridPage />} />
                    <Route path="/themes/:themeId/:puzzleId" element={<GamePage />} />
                    <Route path="/play/:puzzleId" element={<GamePage />} />
                    <Route path="/create" element={<CreatorPage />} />
                    <Route path="/stats" element={<StatsPage />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </WalletProviderContext.Provider>
        </ThemeProviderContext.Provider>
      </ProgressProviderContext.Provider>
    </PuzzleProviderContext.Provider>
  );
}

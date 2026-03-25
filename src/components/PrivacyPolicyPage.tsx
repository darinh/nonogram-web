import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import styles from '../styles/PrivacyPolicyPage.module.css';

export default function PrivacyPolicyPage() {
  usePageTitle('Privacy Policy — Nonogram');

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>
        ← Back to Home
      </Link>

      <h1 className={styles.title}>Privacy Policy</h1>
      <p className={styles.updated}>Last Updated: July 19, 2025</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. What Data We Collect</h2>
        <p className={styles.text}>
          When you use Nonogram, we may collect the following information
          depending on how you interact with the app:
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Account information:</strong> Your email address and display
            name, provided through Google sign-in
          </li>
          <li>
            <strong>Puzzle progress:</strong> Completed puzzles, current grid
            state for in-progress puzzles, and completion times
          </li>
          <li>
            <strong>Coin balance and transactions:</strong> Your in-game coin
            balance and history of how coins were earned or spent (hints,
            rewards)
          </li>
          <li>
            <strong>Theme progress:</strong> Which puzzle themes you have
            unlocked or completed
          </li>
          <li>
            <strong>Streak data:</strong> Daily puzzle completion dates used to
            calculate your current and longest streaks
          </li>
          <li>
            <strong>App preferences:</strong> Settings such as dark mode and
            sound preferences
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. How We Collect Data</h2>
        <p className={styles.text}>We collect data in two ways:</p>
        <ul className={styles.list}>
          <li>
            <strong>Through Google sign-in:</strong> When you sign in with your
            Google account, we receive your email address and display name from
            Google
          </li>
          <li>
            <strong>Through gameplay:</strong> As you play puzzles, your
            progress, coin transactions, streak data, and preferences are
            recorded automatically
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Why We Collect Data</h2>
        <p className={styles.text}>
          We use the data we collect solely to provide and improve your game
          experience:
        </p>
        <ul className={styles.list}>
          <li>
            To save your game progress so you can pick up where you left off
          </li>
          <li>
            To enable cross-device syncing of your progress when you are signed
            in
          </li>
          <li>
            To provide game features such as coins, hints, daily puzzles, and
            streak tracking
          </li>
          <li>
            To remember your preferences (dark mode, sound settings) across
            sessions
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. How Data Is Stored</h2>
        <p className={styles.text}>
          <strong>Authenticated users:</strong> If you sign in with Google, your
          data is stored in Firebase Firestore, a cloud database service operated
          by Google. This allows your data to sync across devices.
        </p>
        <p className={styles.text}>
          <strong>Anonymous users:</strong> If you use the app without signing
          in, your data is stored locally in your browser&apos;s localStorage.
          This data stays on your device and is not sent to any server.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>5. Data Sharing</h2>
        <p className={styles.text}>
          We do <strong>not</strong> sell, share, rent, or transfer your personal
          data to third parties. We do not use your data for advertising.
        </p>
        <p className={styles.text}>
          Firebase and Google process data on our behalf as part of providing the
          Firestore database and authentication services. Their handling of data
          is governed by{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactLink}
          >
            Google&apos;s Privacy Policy
          </a>{' '}
          and{' '}
          <a
            href="https://firebase.google.com/support/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactLink}
          >
            Firebase&apos;s Privacy and Security documentation
          </a>
          .
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>6. Cookies and Local Storage</h2>
        <p className={styles.text}>
          We use minimal cookies and browser storage:
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Firebase Auth session cookie:</strong> Used to keep you
            signed in between visits
          </li>
          <li>
            <strong>localStorage:</strong> Used to store your game progress (for
            anonymous users), preferences (dark mode, sound settings), and other
            app state
          </li>
        </ul>
        <p className={styles.text}>
          We do not use tracking cookies, analytics cookies, or third-party
          advertising cookies.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>7. Your Rights and Choices</h2>
        <p className={styles.text}>
          You have the following options regarding your data:
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Request data deletion:</strong> You can request that we
            delete your account and all associated data by contacting us at the
            email address below
          </li>
          <li>
            <strong>Log out:</strong> You can log out at any time to stop data
            from being synced to the cloud
          </li>
          <li>
            <strong>Use anonymously:</strong> You can use the app without signing
            in — your data will only be stored locally in your browser and will
            not be sent to any server
          </li>
          <li>
            <strong>Clear local data:</strong> You can clear your browser&apos;s
            localStorage at any time to remove all locally stored data
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>8. Children&apos;s Privacy</h2>
        <p className={styles.text}>
          Nonogram is not specifically designed for or directed at children under
          the age of 13. We do not knowingly collect personal information from
          children under 13. If you believe a child under 13 has provided us with
          personal data, please contact us and we will promptly delete it.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>9. Changes to This Policy</h2>
        <p className={styles.text}>
          We may update this Privacy Policy from time to time. When we do, we
          will revise the &quot;Last Updated&quot; date at the top of this page.
          Your continued use of the app after any changes constitutes your
          acceptance of the updated policy.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>10. Contact</h2>
        <p className={styles.text}>
          If you have questions about this Privacy Policy or wish to exercise
          your data rights, please contact us at:{' '}
          <span className={styles.contactLink}>[contact@example.com]</span>
        </p>
      </section>

      <div className={styles.disclaimer}>
        <p>
          <strong>Disclaimer:</strong> This Privacy Policy is provided for
          informational purposes only and does not constitute legal advice.
        </p>
      </div>
    </div>
  );
}

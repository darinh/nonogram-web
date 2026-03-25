import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import styles from '../styles/TermsPage.module.css';

export default function TermsPage() {
  usePageTitle('Terms & Conditions — Nonogram');

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>
        ← Back to Home
      </Link>

      <h1 className={styles.title}>Terms &amp; Conditions</h1>
      <p className={styles.updated}>Last Updated: July 19, 2025</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
        <p className={styles.text}>
          By accessing or using Nonogram (&quot;the app&quot;), you agree to be
          bound by these Terms &amp; Conditions. If you do not agree to these
          terms, please do not use the app.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. Service Description</h2>
        <p className={styles.text}>
          Nonogram is a free, web-based nonogram (picross) puzzle game. The app
          allows you to solve logic puzzles, track your progress, earn in-game
          coins, create custom puzzles, and participate in daily challenges. No
          payment is required to use the app.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. User Accounts</h2>
        <p className={styles.text}>
          Creating an account is optional. You may use the app without signing
          in, in which case your data is stored locally in your browser.
        </p>
        <p className={styles.text}>
          If you choose to sign in with Google, you agree to the following:
        </p>
        <ul className={styles.list}>
          <li>You may create only one account per person</li>
          <li>
            You are responsible for maintaining the security of your Google
            account
          </li>
          <li>
            You must not share your account or allow others to access the app
            through your account
          </li>
          <li>
            You accept responsibility for all activity that occurs under your
            account
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. Acceptable Use</h2>
        <p className={styles.text}>
          When using the app, you agree <strong>not</strong> to:
        </p>
        <ul className={styles.list}>
          <li>
            Attempt to hack, exploit, or gain unauthorized access to the app,
            its servers, or its data
          </li>
          <li>
            Reverse engineer, decompile, or disassemble any part of the app
          </li>
          <li>
            Use automated tools, bots, or scripts to interact with the app
          </li>
          <li>
            Abuse game mechanics, including exploiting bugs to gain coins,
            manipulate streaks, or falsify progress
          </li>
          <li>
            Interfere with or disrupt the app&apos;s operation or other
            users&apos; experience
          </li>
          <li>
            Use the app for any unlawful purpose or in violation of any
            applicable laws
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>5. Intellectual Property</h2>
        <p className={styles.text}>
          All content in the app — including puzzles, designs, graphics, text,
          and code — is the property of Nonogram or its licensors and is
          protected by applicable intellectual property laws. You may not copy,
          distribute, modify, or create derivative works from the app&apos;s
          content without prior written permission.
        </p>
        <p className={styles.text}>
          Puzzles you create using the app&apos;s puzzle creator remain your
          intellectual property. However, by saving puzzles within the app, you
          grant us a non-exclusive, royalty-free license to store and display
          those puzzles as part of the service.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>6. No Warranty</h2>
        <p className={styles.text}>
          The app is provided <strong>&quot;as is&quot;</strong> and{' '}
          <strong>&quot;as available&quot;</strong> without warranties of any
          kind, whether express or implied. We do not guarantee that the app will
          be available at all times, free of errors, or that any defects will be
          corrected.
        </p>
        <p className={styles.text}>
          We reserve the right to modify, suspend, or discontinue the app (or
          any part of it) at any time without notice.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>7. Limitation of Liability</h2>
        <p className={styles.text}>
          To the fullest extent permitted by law, we are not liable for any
          indirect, incidental, special, consequential, or punitive damages
          arising from your use of the app. This includes, but is not limited
          to:
        </p>
        <ul className={styles.list}>
          <li>
            Loss of data, including game progress or account information
          </li>
          <li>Service interruptions or downtime</li>
          <li>
            Any errors or inaccuracies in the app&apos;s content or
            functionality
          </li>
          <li>
            Unauthorized access to your account due to your own negligence
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>8. Account Termination</h2>
        <p className={styles.text}>
          We reserve the right to suspend or terminate your account at our
          discretion if we believe you have violated these terms. In such cases,
          you may lose access to your account data, including game progress and
          coin balance.
        </p>
        <p className={styles.text}>
          You may stop using the app at any time. If you wish to have your
          account data deleted, please contact us at the email address below.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>9. Changes to These Terms</h2>
        <p className={styles.text}>
          We may modify these terms at any time. When we make changes, we will
          update the &quot;Last Updated&quot; date at the top of this page. Your
          continued use of the app after any changes constitutes your acceptance
          of the revised terms.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>10. Governing Law</h2>
        <p className={styles.text}>
          These terms are governed by and construed in accordance with the laws
          of [your jurisdiction]. Any disputes arising from these terms or your
          use of the app will be resolved in the courts of [your jurisdiction].
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>11. Contact</h2>
        <p className={styles.text}>
          If you have questions about these Terms &amp; Conditions, please
          contact us at:{' '}
          <span className={styles.contactLink}>[contact@example.com]</span>
        </p>
      </section>

      <div className={styles.disclaimer}>
        <p>
          <strong>Disclaimer:</strong> These Terms &amp; Conditions are provided
          for informational purposes only and do not constitute legal advice.
        </p>
      </div>
    </div>
  );
}

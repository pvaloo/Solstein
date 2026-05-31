import { Link } from "react-router-dom";

const termsSections = [
  "Acceptance & Eligibility",
  "The Service",
  "Accounts & Invitations",
  "Acceptable Use",
  "Customer Data",
  "Confidentiality",
  "Intellectual Property",
  "Privacy",
  "Fees & Billing",
  "Term & Termination",
  "Warranties & Disclaimers",
  "Limitation of Liability",
  "Indemnification",
  "Governing Law",
  "Changes to these Terms",
  "Contact",
];

const privacySections = [
  "Summary",
  "Who we are",
  "Data we collect",
  "How we use it",
  "Legal bases (UK / EU)",
  "Sharing & subprocessors",
  "International transfers",
  "Retention",
  "Your rights",
  "Security",
  "Cookies & local storage",
  "Children",
  "Changes to this policy",
  "Contact",
];

const legalConfig = {
  terms: {
    title: "Terms of Service",
    placeholder:
      "These Terms are a first-pass draft, not legal-reviewed. Replace before public launch.",
    effective: "1 May 2026",
    version: "2.4",
    supersedes: "v2.3 · 18 Nov 2025",
    lede:
      "These Terms govern your use of the Solstein workspace, including solstein.app, the Operator Console, and any associated services. By accepting an invitation, signing in, or otherwise using the Service, you agree to be bound by these Terms.",
    sections: termsSections,
    alternateLabel: "Privacy Policy",
    alternatePath: "/privacy",
  },
  privacy: {
    title: "Privacy Policy",
    placeholder:
      "This Privacy Policy is a first-pass draft, not legal-reviewed. Replace before public launch.",
    effective: "1 May 2026",
    version: "3.1",
    supersedes: "v3.0 · 12 Jan 2026",
    lede:
      "Solstein Labs Ltd. takes privacy seriously. This policy explains what personal data we collect when you use our workspace, why we collect it, how long we keep it, and the rights you have over it. It applies to solstein.app, the Operator Console, and our transactional emails.",
    sections: privacySections,
    alternateLabel: "Terms of Service",
    alternatePath: "/terms",
  },
};

export function LegalPage({ kind }) {
  const page = legalConfig[kind] ?? legalConfig.terms;

  return (
    <>
      <div className="legal-placeholder" role="note">
        <strong>Placeholder copy.</strong> {page.placeholder}
      </div>

      <main className="legal-shell">
        <header className="legal-head">
          <div className="kicker">§ Legal</div>
          <h1 className="page-title">{page.title}</h1>
          <div className="meta">
            <span>
              Effective <strong>{page.effective}</strong>
            </span>
            <span>
              Version <strong>{page.version}</strong>
            </span>
            <span>
              Supersedes <strong>{page.supersedes}</strong>
            </span>
          </div>
          <p className="lede">{page.lede}</p>
        </header>

        <div className="legal-body legal-counter">
          <nav className="legal-toc" aria-label="Contents">
            <div className="lbl">§ Contents</div>
            <ol>
              {page.sections.map((section, index) => (
                <li key={section}>
                  <a href={`#s${index + 1}`}>{section}</a>
                </li>
              ))}
            </ol>
          </nav>

          <div>
            {page.sections.map((section, index) => (
              <section className="legal-section" id={`s${index + 1}`} key={section}>
                <h2>
                  <span>{section}</span>
                </h2>
                <div className="sec-body">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                    nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                    fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <div className="callout">
                    <strong>§ Plain English</strong>
                    Placeholder summary. Copy for this section to be drafted with legal.
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>

        <footer className="legal-foot">
          <span>© 2026 Solstein Labs Ltd. · All rights reserved.</span>
          <div>
            <Link to={page.alternatePath}>{page.alternateLabel}</Link>
            <span aria-hidden="true"> · </span>
            <a href="https://status.solstein.app" target="_blank" rel="noopener noreferrer">
              Status
            </a>
            <span aria-hidden="true"> · </span>
            <Link to="/sign-in">Sign In</Link>
          </div>
        </footer>
      </main>
    </>
  );
}

import { useEffect, useMemo, useRef } from "react";
import operatorDashboardHtml from "../../original_files/html/operator-dashboard.html?raw";
import operatorInvitationsHtml from "../../original_files/html/operator-invitations.html?raw";
import operatorUsersHtml from "../../original_files/html/operator-users.html?raw";
import operatorChromeScript from "../../operator-chrome.js?raw";
import userMenuScript from "../../user-menu.js?raw";

const prototypeHtmlByFile = {
  "operator-dashboard.html": operatorDashboardHtml,
  "operator-invitations.html": operatorInvitationsHtml,
  "operator-users.html": operatorUsersHtml,
};

const htmlRouteByFile = {
  "accept-invite.html": "/invite/demo",
  "forgot-password.html": "/forgot",
  "home.html": "/",
  "import-wizard.html": "/project/demo/import",
  "new-project.html": "/new-project",
  "operator-dashboard.html": "/operator/",
  "operator-invitations.html": "/operator/invitations",
  "operator-sign-in.html": "/operator/sign-in",
  "operator-users.html": "/operator/users",
  "privacy.html": "/privacy",
  "profile.html": "/profile",
  "project.html": "/project/demo",
  "reset-password.html": "/reset/demo",
  "sign-in.html": "/sign-in",
  "signed-out.html": "/signed-out",
  "terms.html": "/terms",
  "verify-email.html": "/verify/demo",
};

function firstMatch(source, pattern) {
  return source.match(pattern)?.[1] ?? "";
}

function extractAttributes(source, tagName) {
  const tag = source.match(new RegExp(`<${tagName}([^>]*)>`, "i"))?.[1] ?? "";
  const attrs = {};
  tag.replace(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:=(["'])(.*?)\2)?/g, (_, name, _quote, value = "") => {
    attrs[name] = value;
    return "";
  });
  return attrs;
}

function rewriteLinks(source) {
  return source.replace(/\bhref=(["'])([^"']+\.html)(#[^"']*)?\1/g, (match, quote, href, hash = "") => {
    const route = htmlRouteByFile[href];
    return route ? `href=${quote}${route}${hash}${quote}` : match;
  });
}

function parsePrototype(html) {
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1])
    .join("\n");
  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);
  const body = firstMatch(html, /<body[^>]*>([\s\S]*?)<\/body>/i)
    .replace(/<script[\s\S]*?<\/script>/gi, "");

  return {
    bodyAttributes: extractAttributes(html, "body"),
    htmlAttributes: extractAttributes(html, "html"),
    bodyHtml: rewriteLinks(body),
    inlineScripts,
    styles,
    usesOperatorChrome: html.includes("operator-chrome.js"),
    usesUserMenu: html.includes("user-menu.js"),
  };
}

function applyAttributes(target, attrs) {
  const previous = new Map();

  Object.entries(attrs).forEach(([name, value]) => {
    previous.set(name, target.getAttribute(name));
    target.setAttribute(name, value);
  });

  return () => {
    previous.forEach((value, name) => {
      if (value === null) target.removeAttribute(name);
      else target.setAttribute(name, value);
    });
  };
}

export function PrototypeRoutePage({ route }) {
  const rootRef = useRef(null);
  const html = prototypeHtmlByFile[route.prototype];
  const parsed = useMemo(() => (html ? parsePrototype(html) : null), [html]);

  useEffect(() => {
    if (!parsed || !rootRef.current) return undefined;

    const restoreHtmlAttrs = applyAttributes(document.documentElement, parsed.htmlAttributes);
    const restoreBodyAttrs = applyAttributes(document.body, parsed.bodyAttributes);

    if (parsed.usesUserMenu) {
      // The imported prototype markup owns the menu DOM; run its original wiring after insertion.
      window.eval(userMenuScript);
    }

    parsed.inlineScripts.forEach((script) => {
      // The static prototypes contain small page-local scripts that populate tables and panels.
      window.eval(script);
    });

    if (parsed.usesOperatorChrome) {
      window.eval(operatorChromeScript);
    }

    return () => {
      restoreBodyAttrs();
      restoreHtmlAttrs();
    };
  }, [parsed]);

  if (!parsed) {
    return (
      <main className="page">
        <div className="banner is-error workspace-banner">
          <div className="banner-mark" />
          <div className="banner-body">
            <span className="ban-title">Prototype missing</span>
            No original file is mapped for {route.prototype}.
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{parsed.styles}</style>
      <div
        className="prototype-route-page"
        ref={rootRef}
        dangerouslySetInnerHTML={{ __html: parsed.bodyHtml }}
      />
    </>
  );
}

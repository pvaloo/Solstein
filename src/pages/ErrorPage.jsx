import { useNavigate } from "react-router-dom";
import { AuthChrome } from "../components/AuthChrome.jsx";

export function ErrorPage({ code = "404" }) {
  const navigate = useNavigate();
  const isServerError = code === "500";

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  }

  return (
    <AuthChrome>
      <section className="auth-card route-error-card">
        <div className={`err-code${isServerError ? " is-risk" : ""}`}>
          {code}
          <span className="glyph-line" />
        </div>
        <p className="auth-card-eyebrow route-error-eyebrow">
          § {isServerError ? "Server Error" : "Not Found"}
        </p>
        <h1>{isServerError ? "Something Went Wrong" : "Page Not Found"}</h1>
        <p className="sub">
          {isServerError
            ? "A request to Solstein failed unexpectedly. Retry the action, or contact support if it keeps happening."
            : "The page you're looking for does not exist, or has been moved. Check the URL, or head back to your workspace."}
        </p>

        <div className="err-actions">
          <button className="btn btn-primary" type="button" onClick={goBack}>
            Go Back
          </button>
        </div>
      </section>
    </AuthChrome>
  );
}

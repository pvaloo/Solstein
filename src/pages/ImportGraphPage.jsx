import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import sampleGraph from "../../data/car-insurance-comparison.json";
import { createProjectGraph } from "../lib/projects.js";

function validateGraph(payload) {
  if (!payload || typeof payload !== "object") {
    return "Graph JSON must be an object.";
  }

  if (!Array.isArray(payload.nodes) || !Array.isArray(payload.edges)) {
    return "Graph JSON must include nodes and edges arrays.";
  }

  return null;
}

function graphNameFromPayload(payload) {
  return payload?.project?.name ?? payload?.name ?? "Imported graph";
}

export function ImportGraphPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [graphPayload, setGraphPayload] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);

  async function commitGraph(payload) {
    const validationError = validateGraph(payload);
    if (validationError) {
      setError(new Error(validationError));
      return;
    }

    setIsImporting(true);
    setError(null);

    const { graph, error: createError } = await createProjectGraph(
      projectId,
      graphNameFromPayload(payload),
      payload,
    );

    setIsImporting(false);

    if (createError) {
      setError(createError);
      return;
    }

    navigate(`/project/${projectId}/graph/${graph.id}`);
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setSelectedFileName(file.name);
    setError(null);

    if (!file.name.toLowerCase().endsWith(".json") && file.type !== "application/json") {
      setError(new Error("Please upload a JSON file."));
      return;
    }

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const validationError = validateGraph(payload);

      if (validationError) {
        setGraphPayload(null);
        setError(new Error(validationError));
        return;
      }

      setGraphPayload(payload);
    } catch (fileError) {
      setGraphPayload(null);
      setError(fileError);
    }
  }

  return (
    <main className="page import-page">
      <Link className="back-link" to={`/project/${projectId}`}>
        ← Project
      </Link>
      <div className="kicker">§ Import graph</div>
      <h1 className="page-title">Import graph</h1>

      <div className="wiz-stepper" aria-hidden="true">
        {["Upload", "Validate", "Import"].map((step, index) => (
          <div className={`wiz-step${index === 0 ? " is-current" : ""}`} key={step}>
            <span className="mark">{index + 1}</span>
            <span className="label">{step}</span>
            {index < 2 ? <span className="wiz-rail" /> : null}
          </div>
        ))}
      </div>

      <section className="wiz-body">
        <h2>Bring in graph JSON</h2>
        <p className="sub">
          Upload a graph JSON payload or import the bundled Solstein sample graph.
        </p>

        {error ? (
          <div className="banner is-error workspace-banner">
            <div className="banner-mark" />
            <div className="banner-body">
              <span className="ban-title">Import blocked</span>
              {error.message}
            </div>
          </div>
        ) : null}

        <div className="dropzone">
          <div className="ic">JSON</div>
          <div className="ttl">Upload graph JSON</div>
          <div className="alt">
            {selectedFileName || "Choose a local .json file"}
          </div>
          <label className="reset upload-control">
            Choose file
            <input type="file" accept="application/json,.json" onChange={handleFileUpload} />
          </label>
          <div className="dropzone-separator">or</div>
          <button
            className="reset"
            type="button"
            onClick={() => {
              setSelectedFileName("Bundled sample graph");
              setGraphPayload(sampleGraph);
              setError(null);
            }}
            disabled={isImporting}
          >
            Load bundled sample
          </button>
        </div>

        <div className="wiz-foot">
          <Link className="btn btn-ghost" to={`/project/${projectId}`}>
            Cancel
          </Link>
          <span className="counter">
            {graphPayload?.nodes?.length ?? 0} nodes · {graphPayload?.edges?.length ?? 0} edges
          </span>
          <button
            className="btn btn-primary"
            type="button"
            disabled={!graphPayload || isImporting}
            onClick={() => commitGraph(graphPayload)}
          >
            {isImporting ? "Importing" : "Commit graph"}
          </button>
        </div>
      </section>
    </main>
  );
}

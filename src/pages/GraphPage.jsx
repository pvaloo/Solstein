import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getGraphDocument } from "../lib/projects.js";
import { CanvasLoadingShell, FlowLensCanvas } from "./FlowLensCanvas.jsx";

export function GraphPage() {
  const { projectId, graphId } = useParams();
  const [graph, setGraph] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadGraph() {
      setIsLoading(true);
      setError(null);

      const graphResult = await getGraphDocument(graphId);

      if (!isMounted) return;

      if (graphResult.error) {
        setError(graphResult.error);
      }

      setGraph(graphResult.graph);
      setIsLoading(false);
    }

    loadGraph();

    return () => {
      isMounted = false;
    };
  }, [graphId, projectId]);

  if (isLoading) {
    return (
      <CanvasLoadingShell
        projectPath={`/project/${projectId}`}
        status="Loading graph"
      />
    );
  }

  if (error || !graph) {
    return (
      <main className="page graph-document-page">
        <Link className="back-link" to={`/project/${projectId}`}>
          &lt;- Project
        </Link>
        <div className="banner is-error workspace-banner">
          <div className="banner-mark" />
          <div className="banner-body">
            <span className="ban-title">Graph unavailable</span>
            {error?.message ?? "This graph could not be loaded."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <FlowLensCanvas graph={graph} projectId={projectId} />
  );
}

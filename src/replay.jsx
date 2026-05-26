/* global React */
const { useState, useEffect, useRef, useCallback } = React;

// Replay state shape:
//   { activeNodes: Set<string>, activeEdges: Map<string, durationMs> }
// The transport drives steps and updates this state.

function useReplay(scenarios) {
  const [scenarioId, setScenarioId] = useState(null);
  const scenario = scenarios.find(s => s.id === scenarioId) || null;
  const steps = scenario?.steps || [];
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [activeNodes, setActiveNodes] = useState(new Set());
  const [activeEdges, setActiveEdges] = useState(new Map());
  const timeoutRef = useRef(null);

  // Reset when scenario changes
  useEffect(() => {
    setStepIdx(-1);
    setActiveNodes(new Set());
    setActiveEdges(new Map());
  }, [scenarioId]);

  // Execute a step at index i — set active state, fade after duration
  const executeStep = useCallback((i) => {
    const step = steps[i];
    if (!step) return;
    if (step.nodeId) {
      setActiveNodes(prev => new Set(prev).add(step.nodeId));
      window.setTimeout(() => {
        setActiveNodes(prev => {
          const next = new Set(prev);
          next.delete(step.nodeId);
          return next;
        });
      }, step.durationMs);
    }
    if (step.edgeId) {
      setActiveEdges(prev => {
        const next = new Map(prev);
        next.set(step.edgeId, step.durationMs);
        return next;
      });
      window.setTimeout(() => {
        setActiveEdges(prev => {
          const next = new Map(prev);
          next.delete(step.edgeId);
          return next;
        });
      }, step.durationMs);
    }
  }, [steps]);

  // Driver
  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const next = stepIdx + 1;
    const step = steps[next];
    setStepIdx(next);
    executeStep(next);
    timeoutRef.current = window.setTimeout(() => {
      // advance handled by next effect run via stepIdx change
    }, step.durationMs);
    return () => window.clearTimeout(timeoutRef.current);
  }, [playing, stepIdx, steps, executeStep]);

  const play = () => {
    if (stepIdx >= steps.length - 1) setStepIdx(-1);
    setPlaying(true);
  };
  const pause = () => setPlaying(false);
  const reset = () => {
    setPlaying(false);
    setStepIdx(-1);
    setActiveNodes(new Set());
    setActiveEdges(new Map());
  };
  const stepForward = () => {
    setPlaying(false);
    if (stepIdx < steps.length - 1) {
      const next = stepIdx + 1;
      setStepIdx(next);
      executeStep(next);
    }
  };
  const stepBack = () => {
    setPlaying(false);
    if (stepIdx > -1) setStepIdx(stepIdx - 1);
  };

  return {
    scenarios, scenarioId, setScenarioId, scenario,
    steps, stepIdx,
    playing, play, pause, reset, stepForward, stepBack,
    state: { activeNodes, activeEdges },
  };
}

function ReplayTransport({ replay }) {
  const { scenarios, scenarioId, setScenarioId, steps, stepIdx, playing, play, pause, reset, stepForward, stepBack } = replay;

  const progress = steps.length > 0 ? Math.max(0, (stepIdx + 1) / steps.length) : 0;

  return React.createElement('div', { className: 'transport' },
    React.createElement('div', { className: 'scenario' },
      React.createElement('span', { className: 'lbl' }, 'Replay'),
      React.createElement(window.SolDropdownReact, {
        value: scenarioId,
        onChange: setScenarioId,
        options: scenarios.map(s => ({ value: s.id, label: s.label })),
        small: true,
      }),
    ),

    React.createElement('div', { className: 'controls' },
      React.createElement('button', { className: 'tbtn', onClick: reset, title: 'Reset' },
        React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'currentColor' },
          React.createElement('path', { d: 'M3 2h2v12H3z' }),
          React.createElement('path', { d: 'M14 2L6 8l8 6z' }),
        )
      ),
      React.createElement('button', { className: 'tbtn', onClick: stepBack, title: 'Step back' },
        React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'currentColor' },
          React.createElement('path', { d: 'M5 8L13 3v10z' }),
          React.createElement('path', { d: 'M3 3h1.5v10H3z' }),
        )
      ),
      React.createElement('button', {
        className: 'tbtn play' + (playing ? ' is-playing' : ''),
        onClick: playing ? pause : play,
        title: playing ? 'Pause' : 'Play',
      },
        playing
          ? React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'currentColor' },
              React.createElement('rect', { x: 4, y: 3, width: 3, height: 10 }),
              React.createElement('rect', { x: 9, y: 3, width: 3, height: 10 }),
            )
          : React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'currentColor' },
              React.createElement('path', { d: 'M4 3l9 5-9 5z' })
            )
      ),
      React.createElement('button', { className: 'tbtn', onClick: stepForward, title: 'Step forward' },
        React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'currentColor' },
          React.createElement('path', { d: 'M11 8L3 3v10z' }),
          React.createElement('path', { d: 'M11.5 3H13v10h-1.5z' }),
        )
      ),
    ),

    React.createElement('div', { className: 'timeline' },
      React.createElement('div', { className: 'progress' },
        React.createElement('div', { className: 'bar', style: { width: `${progress * 100}%` } }),
      ),
      React.createElement('div', { className: 'step' },
        React.createElement('strong', null, Math.max(0, stepIdx + 1)),
        ' / ',
        steps.length
      ),
    ),
  );
}

window.useReplay = useReplay;
window.ReplayTransport = ReplayTransport;

import React, { useMemo, useCallback, useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import './PlanGraphOverlay.css';

const statusToStyle = (status) => {
  if (status === 'running') return { background: '#e0f2fe', color: '#075985', border: '1px solid #7dd3fc' };
  if (status === 'success') return { background: '#dcfce7', color: '#065f46', border: '1px solid #86efac' };
  if (status === 'failed') return { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
  return { background: '#f5f5dc', color: '#7c4a03', border: '1px solid #e5d5b5' };
};

const buildElements = (plan, execution) => {
  if (!plan) return { nodes: [], edges: [] };
  const isParallel = plan.type === 'parallel';
  const nodes = [];
  const edges = [];

  const stepMap = new Map();
  if (execution && execution.steps) {
    execution.steps.forEach((st) => stepMap.set(st.name, st));
  }

  const nodeFor = (id, name, position) => {
    const st = stepMap.get(name);
    const running = st && st.status === 'running';
    const elapsed = running ? Math.max(0, (st.durationSeconds || 0) - (st.remainingSeconds || 0)) : null;
    const labelNode = (
      <div className="rf-node-label">
        <span>{name}</span>
        {running && <span className="rf-timer"> {elapsed}s</span>}
      </div>
    );
    return { id, position, data: { label: labelNode }, style: { padding: 10, borderRadius: 8, ...statusToStyle(st?.status) } };
  };

  nodes.push(nodeFor('start', 'Start', { x: 50, y: 50 }));

  if (isParallel) {
    plan.steps.forEach((name, idx) => {
      const y = 150 + idx * 100;
      const nodeId = `agent-${idx}`;
      nodes.push(nodeFor(nodeId, name, { x: 250, y }));
      edges.push({ id: `e-start-${nodeId}`, source: 'start', target: nodeId });
    });
    nodes.push(nodeFor('end', 'End', { x: 500, y: 150 + (plan.steps.length - 1) * 50 }));
    plan.steps.forEach((_, idx) => {
      edges.push({ id: `e-agent-${idx}-end`, source: `agent-${idx}`, target: 'end' });
    });
  } else {
    let lastId = 'start';
    let x = 250;
    let y = 50;
    plan.steps.forEach((name, idx) => {
      const nodeId = `agent-${idx}`;
      nodes.push(nodeFor(nodeId, name, { x, y }));
      edges.push({ id: `e-${lastId}-${nodeId}`, source: lastId, target: nodeId });
      lastId = nodeId;
      x += 200;
    });
    nodes.push(nodeFor('end', 'End', { x, y }));
    edges.push({ id: `e-${lastId}-end`, source: lastId, target: 'end' });
  }

  return { nodes, edges };
};

const PlanGraphOverlay = ({ plan, execution, onClose }) => {
  const initial = useMemo(() => buildElements(plan, execution), [plan, execution]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  useEffect(() => {
    const updated = buildElements(plan, execution);
    // Preserve current positions by matching ids when possible
    setNodes((prev) => updated.nodes.map((n) => {
      const existing = prev.find((p) => p.id === n.id);
      return existing ? { ...n, position: existing.position } : n;
    }));
    setEdges(updated.edges);
  }, [plan, execution, setNodes, setEdges]);

  const onPaneClick = useCallback((evt) => {
    evt.stopPropagation();
  }, []);

  return (
    <div className="plan-overlay" onClick={onClose}>
      <div className="plan-overlay-content" onClick={onPaneClick}>
        <div className="plan-overlay-header">
          <span>Execution Graph</span>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="plan-legend">
          <div className="legend-item"><span className="legend-dot" style={{ background: '#f5f5dc', borderColor: '#e5d5b5' }}></span>Pending</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#e0f2fe', borderColor: '#7dd3fc' }}></span>Running</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#dcfce7', borderColor: '#86efac' }}></span>Completed</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#fee2e2', borderColor: '#fca5a5' }}></span>Failed</div>
        </div>
        <div style={{ height: 400 }}>
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            onNodesChange={onNodesChange} 
            onEdgesChange={onEdgesChange} 
            fitView 
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
          >
            <MiniMap />
            <Controls />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default PlanGraphOverlay; 
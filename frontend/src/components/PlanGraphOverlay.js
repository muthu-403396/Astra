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
  if (!plan || !plan.steps) return { nodes: [], edges: [] };

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

  const nodes = [];
  const edges = [];
  let x = 50;
  const yStep = 100;
  const yCenter = 200;

  nodes.push(nodeFor('start', 'Start', { x, y: yCenter }));
  x += 250;

  let lastNodeIds = ['start'];

  plan.steps.forEach((stage, stageIdx) => {
    const currentNodeIds = [];
    const stageId = `stage-${stageIdx}`;

    if (stage.type === 'parallel' && stage.steps.length > 0) {
      stage.steps.forEach((agentName, agentIdx) => {
        const nodeId = `${stageId}-agent-${agentIdx}`;
        const y = yCenter + (agentIdx - (stage.steps.length - 1) / 2) * yStep;
        nodes.push(nodeFor(nodeId, agentName, { x, y }));
        currentNodeIds.push(nodeId);

        lastNodeIds.forEach(prevId => {
          edges.push({ id: `e-${prevId}-${nodeId}`, source: prevId, target: nodeId, animated: true });
        });
      });
      x += 250;
      lastNodeIds = currentNodeIds;
    } else if (stage.type === 'sequential' && stage.steps.length > 0) {
      let lastSeqId = null;
      stage.steps.forEach((agentName, agentIdx) => {
        const nodeId = `${stageId}-agent-${agentIdx}`;
        nodes.push(nodeFor(nodeId, agentName, { x, y: yCenter }));
        
        if (agentIdx === 0) {
          lastNodeIds.forEach(prevId => {
            edges.push({ id: `e-${prevId}-${nodeId}`, source: prevId, target: nodeId, animated: true });
          });
        } else {
          edges.push({ id: `e-${lastSeqId}-${nodeId}`, source: lastSeqId, target: nodeId, animated: true });
        }
        lastSeqId = nodeId;
        x += 250;
      });
      lastNodeIds = lastSeqId ? [lastSeqId] : [];
    }
  });

  nodes.push(nodeFor('end', 'End', { x, y: yCenter }));
  if (lastNodeIds.length > 0) {
    lastNodeIds.forEach(prevId => {
      edges.push({ id: `e-${prevId}-end`, source: prevId, target: 'end', animated: true });
    });
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
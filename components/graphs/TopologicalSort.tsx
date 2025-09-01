import React from 'react';
import useTopologicalSort from './useTopologicalSort';
import GraphControls from './GraphControls';

const TopologicalSort: React.FC = () => {
    const {
        graph,
        nodesList,
        animation,
        isFinding,
        isPaused,
        isFinished,
        speed,
        setSpeed,
        handlePlay,
        handlePause,
        handleNextStep,
        reset,
        handleGenerateCyclicGraph,
        numNodes,
        setNumNodes,
        numEdges,
        setNumEdges,
    } = useTopologicalSort();

    const { inDegrees, queue, sortedResult, currentNode, statusText, cycleNodes } = animation;

    const getNodeColor = (nodeId: string) => {
        if (sortedResult.includes(nodeId)) return '#10b981'; // Emerald-500 for processed
        if (nodeId === currentNode) return '#facc15'; // Yellow-400 for current
        if (queue.includes(nodeId)) return '#60a5fa'; // Blue-400 for in queue
        if (isFinished && cycleNodes.includes(nodeId)) return '#ef4444'; // Red-500 for nodes in cycle
        return '#06b6d4'; // Cyan-500 for default
    };

    const getEdgeColor = (from: string, to: string) => {
        if (from === currentNode) return '#fbbf24'; // Amber-400 for outgoing from current
        if (isFinished && cycleNodes.includes(from) && cycleNodes.includes(to)) return '#b91c1c'; // Dark red for cycle edges
        return '#6b7280'; // Gray-500
    };


    return (
        <div className="flex flex-col h-full">
            <GraphControls
                nodesList={nodesList}
                startNode={null} endNode={null}
                onStartNodeChange={() => {}} onEndNodeChange={() => {}}
                isFinding={isFinding} isPaused={isPaused} isFinished={isFinished}
                speed={speed} onNewGraph={reset} onPlay={handlePlay}
                onPause={handlePause} onNextStep={handleNextStep} onSpeedChange={setSpeed}
                numNodes={numNodes} onNumNodesChange={setNumNodes}
                numEdges={numEdges} onNumEdgesChange={setNumEdges}
                showStartNodeSelector={false} showEndNodeSelector={false}
                onGenerateCyclicGraph={handleGenerateCyclicGraph}
                showCyclicGenerator={true}
            />

            <div className="flex-grow flex flex-col lg:flex-row gap-4 min-h-0">
                {/* Left Panel: Information */}
                <div className="w-full lg:w-80 flex-shrink-0 bg-gray-900 p-3 rounded-md flex flex-col gap-4">
                    <div className="flex-1 space-y-1 overflow-y-auto pr-1">
                        <h3 className="text-center text-gray-400 font-bold mb-2 sticky top-0 bg-gray-900">In-Degrees</h3>
                        {nodesList.map(nodeId => (
                            <div key={nodeId} className="flex justify-between p-2 rounded-md bg-gray-700">
                                <span className="font-bold">{nodeId}</span>
                                <span className="font-mono">{inDegrees.get(nodeId) ?? '-'}</span>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h3 className="text-center text-gray-400 font-bold mb-2">Queue (In-Degree 0)</h3>
                        <div className="flex gap-2 p-2 bg-gray-800/50 rounded-md min-h-[5.5rem] overflow-x-auto">
                           {queue.map((nodeId) => (
                               <div key={nodeId} className="flex-shrink-0 w-14 h-14 text-center bg-blue-500 p-2 rounded-md flex items-center justify-center font-bold text-lg">
                                   {nodeId}
                               </div>
                           ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-center text-gray-400 font-bold mb-2">Sorted Result</h3>
                        <div className="flex flex-wrap gap-2 p-2 bg-gray-800/50 rounded-md min-h-[5.5rem]">
                            {sortedResult.map((nodeId) => (
                                <div key={nodeId} className="w-12 h-12 flex items-center justify-center font-bold bg-emerald-500 rounded-md text-white">
                                    {nodeId}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-center font-mono text-cyan-400 bg-gray-800/50 rounded p-2 flex-grow flex items-center justify-center min-h-[4rem]">
                        {statusText}
                    </div>
                </div>

                {/* Right Panel: Graph Visualization */}
                <div className="flex-grow flex items-center justify-center bg-gray-900 rounded-md overflow-hidden p-2">
                    <svg width="100%" height="100%" viewBox="0 0 800 600">
                        <defs>
                            <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
                            </marker>
                            <marker id="arrowhead-highlight" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
                            </marker>
                             <marker id="arrowhead-cycle" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#b91c1c" />
                            </marker>
                        </defs>
                        {/* Edges */}
                        {Array.from(graph.entries()).map(([fromId, node]) => 
                            Array.from(node.edges.keys()).map(toId => {
                                const toNode = graph.get(toId)!;
                                const isHighlighted = fromId === currentNode;
                                const isCycleEdge = isFinished && cycleNodes.includes(fromId) && cycleNodes.includes(toId);

                                // Shorten the line so the arrow tip touches the circle edge
                                const angle = Math.atan2(toNode.y - node.y, toNode.x - node.x);
                                const endX = toNode.x - 18 * Math.cos(angle);
                                const endY = toNode.y - 18 * Math.sin(angle);
                                
                                return (
                                    <line 
                                        key={`edge-${fromId}-${toId}`}
                                        x1={node.x} y1={node.y} x2={endX} y2={endY}
                                        stroke={getEdgeColor(fromId, toId)} strokeWidth={isHighlighted || isCycleEdge ? 4 : 2}
                                        className="transition-all duration-300"
                                        markerEnd={isHighlighted ? "url(#arrowhead-highlight)" : (isCycleEdge ? "url(#arrowhead-cycle)" : "url(#arrowhead)")}
                                    />
                                );
                            })
                        )}
                        {/* Nodes */}
                        {Array.from(graph.values()).map(node => (
                             <g key={`node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
                                <circle r="18" fill={getNodeColor(node.id)} stroke="#1f2937" strokeWidth="3" className="transition-all duration-300"/>
                                <text textAnchor="middle" dy=".3em" fill="white" fontSize="16" fontWeight="bold">{node.id}</text>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default TopologicalSort;
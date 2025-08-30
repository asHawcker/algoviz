import React from 'react';
import useDijkstra from './useDijkstra';
import GraphControls from './GraphControls';

// Represents a single node in the distances table
const DistanceRow: React.FC<{ node: string; distance: number; isCurrent: boolean }> = ({ node, distance, isCurrent }) => (
    <div className={`flex justify-between p-2 rounded-md transition-colors duration-300 ${isCurrent ? 'bg-yellow-400 text-black' : 'bg-gray-700'}`}>
        <span className="font-bold">{node}</span>
        <span className="font-mono">{distance === Infinity ? '∞' : distance}</span>
    </div>
);

// Represents a single node in the priority queue display
const PriorityQueueItem: React.FC<{ node: string; distance: number }> = ({ node, distance }) => (
    <div className="flex-shrink-0 w-20 text-center bg-cyan-600 p-2 rounded-md">
        <div className="font-bold text-lg">{node}</div>
        <div className="text-sm font-mono">{distance}</div>
    </div>
);

const Dijkstra: React.FC = () => {
    const {
        graph,
        nodesList,
        startNode,
        endNode,
        setStartNode,
        setEndNode,
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
    } = useDijkstra();

    const { distances, priorityQueue, currentNode, visited, path, statusText, edgeToHighlight } = animation;

    // Determine the color for a node based on its state
    const getNodeColor = (nodeId: string) => {
        if (path.includes(nodeId)) return '#10b981'; // Emerald-500 for final path
        if (nodeId === currentNode) return '#facc15'; // Yellow-400 for current
        if (visited.has(nodeId)) return '#4b5563'; // Gray-600 for visited
        if (nodeId === startNode) return '#3b82f6'; // Blue-500 for start
        if (nodeId === endNode) return '#ef4444'; // Red-500 for end
        return '#06b6d4'; // Cyan-500 for default
    };
    
    // Determine the color for an edge based on its state
    const getEdgeColor = (from: string, to: string) => {
        if (path.includes(from) && path.includes(to)) {
             const fromIndex = path.indexOf(from);
             const toIndex = path.indexOf(to);
             if (Math.abs(fromIndex - toIndex) === 1) {
                return '#10b981'; // Emerald-500 for path edges
             }
        }
        if (edgeToHighlight && ((edgeToHighlight[0] === from && edgeToHighlight[1] === to) || (edgeToHighlight[0] === to && edgeToHighlight[1] === from))) {
            return '#60a5fa'; // Blue-400 for relaxing edges
        }
        return '#6b7280'; // Gray-500
    };


    return (
        <div className="flex flex-col h-full">
            <GraphControls
                nodesList={nodesList}
                startNode={startNode}
                endNode={endNode}
                isFinding={isFinding}
                isPaused={isPaused}
                isFinished={isFinished}
                speed={speed}
                onStartNodeChange={setStartNode}
                onEndNodeChange={setEndNode}
                onNewGraph={reset}
                onPlay={handlePlay}
                onPause={handlePause}
                onNextStep={handleNextStep}
                onSpeedChange={setSpeed}
            />

            <div className="flex-grow flex flex-col lg:flex-row gap-4 min-h-0">
                {/* Left Panel: Information */}
                <div className="w-full lg:w-80 flex-shrink-0 bg-gray-900 p-3 rounded-md flex flex-col gap-4">
                    {/* Distances Table */}
                    <div className="flex-shrink-0">
                        <h3 className="text-center text-gray-400 font-bold mb-2">Distances from Start ({startNode})</h3>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                            {nodesList.map(nodeId => (
                                <DistanceRow key={nodeId} node={nodeId} distance={distances.get(nodeId) ?? Infinity} isCurrent={nodeId === currentNode} />
                            ))}
                        </div>
                    </div>
                    {/* Priority Queue */}
                    <div className="flex-shrink-0">
                        <h3 className="text-center text-gray-400 font-bold mb-2">Priority Queue</h3>
                        <div className="flex gap-2 p-2 bg-gray-800/50 rounded-md min-h-[5.5rem] overflow-x-auto">
                           {priorityQueue.map(([nodeId, dist], index) => (
                               <PriorityQueueItem key={`${nodeId}-${index}`} node={nodeId} distance={dist} />
                           ))}
                        </div>
                    </div>
                     {/* Status Log */}
                    <div className="flex-grow flex flex-col">
                        <h3 className="text-center text-gray-400 font-bold mb-2 flex-shrink-0">Status</h3>
                        <div className="text-center font-mono text-cyan-400 bg-gray-800/50 rounded p-2 flex-grow flex items-center justify-center">
                            {statusText}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Graph Visualization */}
                <div className="flex-grow flex items-center justify-center bg-gray-900 rounded-md overflow-hidden p-2">
                    <svg width="100%" height="100%" viewBox="0 0 800 600">
                        {/* Edges */}
                        {Array.from(graph.entries()).map(([fromId, node]) => 
                            Array.from(node.edges.entries()).map(([toId, weight]) => {
                                const toNode = graph.get(toId)!;
                                const isPathEdge = getEdgeColor(fromId, toId) !== '#6b7280';
                                return (
                                    <g key={`edge-${fromId}-${toId}`}>
                                        <line x1={node.x} y1={node.y} x2={toNode.x} y2={toNode.y} stroke={getEdgeColor(fromId, toId)} strokeWidth={isPathEdge ? 4 : 2} className="transition-all duration-300"/>
                                        <text x={(node.x + toNode.x) / 2} y={(node.y + toNode.y) / 2 - 5} textAnchor="middle" fill={isPathEdge ? "#f0f9ff" : "#d1d5db"} fontSize="12" fontWeight="bold">
                                            {weight}
                                        </text>
                                    </g>
                                )
                            })
                        )}
                        {/* Nodes */}
                        {Array.from(graph.values()).map(node => (
                             <g key={`node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}
                                className="cursor-pointer"
                                onClick={() => {
                                    if(isFinding) return;
                                    if(!startNode) setStartNode(node.id);
                                    else if (!endNode && node.id !== startNode) setEndNode(node.id);
                                }}
                             >
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

export default Dijkstra;
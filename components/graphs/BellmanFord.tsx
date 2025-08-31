import React from 'react';
import useBellmanFord from './useBellmanFord';
import GraphControls from './GraphControls';

const BellmanFord: React.FC = () => {
    const {
        graph,
        nodesList,
        startNode,
        setStartNode,
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
        numNodes,
        setNumNodes,
        numEdges,
        setNumEdges,
    } = useBellmanFord();

    const { distances, predecessors, iteration, edgeToHighlight, negativeCyclePath, statusText } = animation;
    
    const getNodeColor = (nodeId: string) => {
        if (negativeCyclePath.includes(nodeId)) return '#dc2626'; // red-600
        if (nodeId === startNode) return '#3b82f6'; // blue-500
        if (edgeToHighlight && (edgeToHighlight[0] === nodeId || edgeToHighlight[1] === nodeId)) return '#facc15'; // yellow-400
        return '#06b6d4'; // cyan-500
    };

    const getEdgeColor = (from: string, to: string) => {
        const isNegativeCycleEdge = negativeCyclePath.includes(from) && negativeCyclePath.includes(to);
        if (isNegativeCycleEdge) {
            const fromIndex = negativeCyclePath.indexOf(from);
            const toIndex = negativeCyclePath.indexOf(to);
            if(fromIndex !== -1 && toIndex !== -1) return '#ef4444'; // red-500
        }
        if (edgeToHighlight && ((edgeToHighlight[0] === from && edgeToHighlight[1] === to) || (edgeToHighlight[0] === to && edgeToHighlight[1] === from))) {
            return '#60a5fa'; // blue-400
        }
        return '#6b7280'; // gray-500
    };

    return (
        <div className="flex flex-col h-full">
            <GraphControls
                nodesList={nodesList}
                startNode={startNode}
                endNode={null} 
                onStartNodeChange={setStartNode}
                onEndNodeChange={() => {}} 
                isFinding={isFinding}
                isPaused={isPaused}
                isFinished={isFinished}
                speed={speed}
                onNewGraph={reset}
                onPlay={handlePlay}
                onPause={handlePause}
                onNextStep={handleNextStep}
                onSpeedChange={setSpeed}
                numNodes={numNodes}
                onNumNodesChange={setNumNodes}
                numEdges={numEdges}
                onNumEdgesChange={setNumEdges}
                showEndNodeSelector={false}
            />

            <div className="flex-grow flex flex-col lg:flex-row gap-4 min-h-0">
                <div className="w-full lg:w-80 flex-shrink-0 bg-gray-900 p-3 rounded-md flex flex-col gap-4">
                    <div className="text-center text-white font-bold text-lg">
                        Iteration: {iteration > (nodesList.length - 1) ? 'Cycle Check' : iteration} / {nodesList.length - 1}
                    </div>
                     <div className="flex-1 space-y-1 max-h-48 overflow-y-auto pr-1">
                        <h3 className="text-center text-gray-400 font-bold mb-2 sticky top-0 bg-gray-900">Distances</h3>
                        {nodesList.map(nodeId => (
                            <div key={nodeId} className={`flex justify-between p-2 rounded-md transition-colors duration-300 ${edgeToHighlight && edgeToHighlight[1] === nodeId ? 'bg-yellow-400/80 text-black' : 'bg-gray-700'}`}>
                                <span className="font-bold">{nodeId}</span>
                                <span className="font-mono">{distances.get(nodeId) === Infinity ? '∞' : distances.get(nodeId)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 space-y-1 max-h-48 overflow-y-auto pr-1">
                        <h3 className="text-center text-gray-400 font-bold mb-2 sticky top-0 bg-gray-900">Predecessors</h3>
                         {nodesList.map(nodeId => (
                            <div key={nodeId} className="flex justify-between p-2 rounded-md bg-gray-700">
                                <span className="font-bold">{nodeId}</span>
                                <span className="font-mono">{predecessors.get(nodeId) || 'null'}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex-grow flex flex-col">
                        <h3 className="text-center text-gray-400 font-bold mb-2 flex-shrink-0">Status</h3>
                        <div className="text-center font-mono text-cyan-400 bg-gray-800/50 rounded p-2 flex-grow flex items-center justify-center">
                            {statusText}
                        </div>
                    </div>
                </div>

                <div className="flex-grow flex items-center justify-center bg-gray-900 rounded-md overflow-hidden p-2">
                    <svg width="100%" height="100%" viewBox="0 0 800 600">
                         <defs>
                            <filter id="text-bg" x="-0.1" y="-0.1" width="1.2" height="1.2">
                                <feFlood floodColor="#27272a" result="bg" />
                                <feMerge>
                                    <feMergeNode in="bg"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        {Array.from(graph.entries()).map(([fromId, node]) => 
                            Array.from(node.edges.entries()).map(([toId, weight]) => {
                                const isHighlighted = getEdgeColor(fromId, toId) !== '#6b7280';
                                return (
                                    <g key={`edge-${fromId}-${toId}`}>
                                        <line x1={node.x} y1={node.y} x2={graph.get(toId)!.x} y2={graph.get(toId)!.y} stroke={getEdgeColor(fromId, toId)} strokeWidth={isHighlighted ? 4 : 2} className="transition-all duration-300"/>
                                        <text x={(node.x + graph.get(toId)!.x) / 2} y={(node.y + graph.get(toId)!.y) / 2 - 5} textAnchor="middle" fill={isHighlighted ? "#f0f9ff" : "#d1d5db"} fontSize="14" fontWeight="bold" filter="url(#text-bg)">{weight}</text>
                                    </g>
                                )
                            })
                        )}
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

export default BellmanFord;

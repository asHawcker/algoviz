import React, { useRef, useEffect } from 'react';
import useKruskal from './useKruskal';
import GraphControls from './GraphControls';

const Kruskal: React.FC = () => {
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
        numNodes,
        setNumNodes,
        numEdges,
        setNumEdges,
    } = useKruskal();
    
    const { sortedEdges, mstEdges, currentEdgeIndex, statusText, componentColors } = animation;
    const currentEdgeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentEdgeRef.current) {
            currentEdgeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentEdgeIndex]);

    const getEdgeStatus = (u: string, v: string) => {
        const inMst = mstEdges.some(edge => (edge.u === u && edge.v === v) || (edge.u === v && edge.v === u));
        if (inMst) return 'MST';
        
        const currentEdge = sortedEdges[currentEdgeIndex];
        if (currentEdge && ((currentEdge.u === u && currentEdge.v === v) || (currentEdge.u === v && currentEdge.v === u))) {
            return 'CONSIDERING';
        }
        
        if (isFinished && !inMst) return 'DISCARDED';
        
        return 'DEFAULT';
    };

    const getNodeColor = (nodeId: string) => componentColors.get(nodeId) || '#06b6d4'; // Default cyan
    
    const getEdgeColor = (from: string, to: string) => {
        const status = getEdgeStatus(from, to);
        switch(status) {
            case 'MST': return '#10b981'; // Emerald-500
            case 'CONSIDERING': return '#facc15'; // Yellow-400
            case 'DISCARDED': return '#ef4444'; // Red-500
            default: return '#6b7280'; // Gray-500
        }
    };
    
    const totalWeight = mstEdges.reduce((sum, edge) => sum + edge.weight, 0);

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
            />
            <div className="flex-grow flex flex-col lg:flex-row gap-4 min-h-0">
                <div className="w-full lg:w-80 flex-shrink-0 bg-gray-900 p-3 rounded-md flex flex-col gap-4">
                    <div className="flex-shrink-0">
                        <h3 className="text-center text-gray-400 font-bold mb-2">Sorted Edges</h3>
                        <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                            {sortedEdges.map((edge, index) => {
                                const status = getEdgeStatus(edge.u, edge.v);
                                let bgColor = 'bg-gray-700';
                                if (status === 'MST') bgColor = 'bg-emerald-800';
                                else if (status === 'CONSIDERING') bgColor = 'bg-yellow-400 text-black';
                                else if (status === 'DISCARDED') bgColor = 'bg-red-800/80 line-through';
                                
                                return (
                                    <div key={index} ref={index === currentEdgeIndex ? currentEdgeRef : null} className={`flex justify-between p-2 rounded-md transition-colors duration-300 ${bgColor}`}>
                                        <span className="font-bold">{edge.u} ↔ {edge.v}</span>
                                        <span className="font-mono">{edge.weight}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                     <div className="flex-grow flex flex-col">
                        <h3 className="text-center text-gray-400 font-bold mb-2 flex-shrink-0">MST Weight: <span className="text-emerald-400 font-mono">{totalWeight}</span></h3>
                        <div className="text-center font-mono text-cyan-400 bg-gray-800/50 rounded p-2 flex-grow flex items-center justify-center">
                            {statusText}
                        </div>
                    </div>
                </div>
                 <div className="flex-grow flex items-center justify-center bg-gray-900 rounded-md overflow-hidden p-2">
                    <svg width="100%" height="100%" viewBox="0 0 800 600">
                         <defs>
                            <filter id="text-bg-kruskal" x="-0.1" y="-0.1" width="1.2" height="1.2">
                                <feFlood floodColor="#27272a" result="bg" />
                                <feMerge>
                                    <feMergeNode in="bg"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        {Array.from(graph.entries()).map(([fromId, node]) => 
                            Array.from(node.edges.entries()).map(([toId, weight]) => {
                                if (fromId > toId) return null;
                                const isHighlighted = getEdgeColor(fromId, toId) !== '#6b7280';
                                return (
                                    <g key={`edge-${fromId}-${toId}`}>
                                        <line x1={node.x} y1={node.y} x2={graph.get(toId)!.x} y2={graph.get(toId)!.y} stroke={getEdgeColor(fromId, toId)} strokeWidth={isHighlighted ? 4 : 2} className="transition-all duration-300"/>
                                        <text x={(node.x + graph.get(toId)!.x) / 2} y={(node.y + graph.get(toId)!.y) / 2 - 5} textAnchor="middle" fill={isHighlighted ? "#f0f9ff" : "#d1d5db"} fontSize="14" fontWeight="bold" filter="url(#text-bg-kruskal)">{weight}</text>
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

export default Kruskal;

import React from 'react';

interface GraphControlsProps {
    nodesList: string[];
    startNode: string | null;
    endNode: string | null;
    isFinding: boolean;
    isPaused: boolean;
    isFinished: boolean;
    speed: number;
    onStartNodeChange: (id: string) => void;
    onEndNodeChange: (id: string) => void;
    onNewGraph: () => void;
    onPlay: () => void;
    onPause: () => void;
    onNextStep: () => void;
    onSpeedChange: (speed: number) => void;
    numNodes: number;
    numEdges: number;
    onNumNodesChange: (nodes: number) => void;
    onNumEdgesChange: (edges: number) => void;
    showStartNodeSelector?: boolean;
    showEndNodeSelector?: boolean;
    onGenerateCyclicGraph?: () => void;
    showCyclicGenerator?: boolean;
}

const GraphControls: React.FC<GraphControlsProps> = ({
    nodesList, startNode, endNode, isFinding, isPaused, isFinished, speed,
    onStartNodeChange, onEndNodeChange, onNewGraph, onPlay, onPause, onNextStep, onSpeedChange,
    numNodes, numEdges, onNumNodesChange, onNumEdgesChange,
    showStartNodeSelector = true,
    showEndNodeSelector = true,
    onGenerateCyclicGraph,
    showCyclicGenerator = false,
}) => {
    return (
        <div className="flex flex-col items-center justify-between gap-2 mb-4 p-2 bg-gray-700 rounded-md">
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button onClick={onNewGraph} disabled={isFinding} className="px-3 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 disabled:bg-gray-800 transition-colors">New Graph</button>
                    {showCyclicGenerator && onGenerateCyclicGraph && (
                        <button 
                            onClick={onGenerateCyclicGraph} 
                            disabled={isFinding} 
                            className="px-3 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-500 disabled:bg-gray-800 transition-colors"
                            title="Generate a new graph guaranteed to have a cycle"
                        >
                            New Cyclic Graph
                        </button>
                    )}
                    {showStartNodeSelector && <NodeSelector label="Start" value={startNode} nodes={nodesList} onChange={onStartNodeChange} disabled={isFinding}/>}
                    {showEndNodeSelector && <NodeSelector label="End" value={endNode} nodes={nodesList.filter(n => n !== startNode)} onChange={onEndNodeChange} disabled={isFinding}/>}
                </div>
                <div className="flex items-center gap-4 flex-wrap justify-center">
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-300 text-sm">Speed</span>
                        <input type="range" min="50" max="1000" step="50" value={1050 - speed} onChange={(e) => onSpeedChange(1050 - Number(e.target.value))} className="w-24 md:w-32 cursor-pointer" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={onPlay} disabled={isFinding && !isPaused} title={isFinished ? "Run Again" : "Play"} className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        </button>
                        <button onClick={onPause} disabled={!isFinding || isPaused || isFinished} title="Pause" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                        </button>
                        <button onClick={onNextStep} disabled={isFinished} title="Next Step" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-6 pt-2 border-t border-gray-600/50 mt-2">
                <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm whitespace-nowrap">Nodes</span>
                    <input
                        type="range"
                        min="5"
                        max="25"
                        value={numNodes}
                        onChange={(e) => onNumNodesChange(Number(e.target.value))}
                        disabled={isFinding}
                        className="w-32 md:w-40 cursor-pointer"
                    />
                    <span className="text-gray-300 text-sm w-6 text-left">{numNodes}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm whitespace-nowrap">Extra Edges</span>
                    <input
                        type="range"
                        min="0"
                        max="30"
                        value={numEdges}
                        onChange={(e) => onNumEdgesChange(Number(e.target.value))}
                        disabled={isFinding}
                        className="w-32 md:w-40 cursor-pointer"
                    />
                    <span className="text-gray-300 text-sm w-6 text-left">{numEdges}</span>
                </div>
            </div>
        </div>
    );
};

interface NodeSelectorProps {
    label: string;
    value: string | null;
    nodes: string[];
    onChange: (id: string) => void;
    disabled?: boolean;
}

const NodeSelector: React.FC<NodeSelectorProps> = ({ label, value, nodes, onChange, disabled }) => (
    <div className="flex items-center gap-2 text-white">
        <label htmlFor={`select-${label}`} className="text-sm font-medium">{label}:</label>
        <select
            id={`select-${label}`}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
            <option value="" disabled>Select</option>
            {nodes.map(nodeId => (
                <option key={nodeId} value={nodeId}>{nodeId}</option>
            ))}
        </select>
    </div>
);

export default GraphControls;
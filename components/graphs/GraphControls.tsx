import React from 'react';
import { FiPlay, FiPause, FiSkipForward } from 'react-icons/fi';

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
}

const GraphControls: React.FC<GraphControlsProps> = ({
    nodesList, startNode, endNode, isFinding, isPaused, isFinished, speed,
    onStartNodeChange, onEndNodeChange, onNewGraph, onPlay, onPause, onNextStep, onSpeedChange
}) => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 p-2 bg-gray-700 rounded-md flex-wrap">
            <div className="flex items-center gap-2 flex-wrap justify-center">
                <button onClick={onNewGraph} disabled={isFinding} className="px-3 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 disabled:bg-gray-800 transition-colors">New Graph</button>
                <NodeSelector label="Start" value={startNode} nodes={nodesList} onChange={onStartNodeChange} disabled={isFinding}/>
                <NodeSelector label="End" value={endNode} nodes={nodesList.filter(n => n !== startNode)} onChange={onEndNodeChange} disabled={isFinding}/>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
                <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm">Speed</span>
                    <input type="range" min="50" max="1000" step="50" value={1050 - speed} onChange={(e) => onSpeedChange(1050 - Number(e.target.value))} className="w-24 md:w-32 cursor-pointer" />
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={onPlay} disabled={!startNode || !endNode || (isFinding && !isPaused)} title={isFinished ? "Run Again" : "Play"} className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiPlay size={20} /></button>
                    <button onClick={onPause} disabled={!isFinding || isPaused || isFinished} title="Pause" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiPause size={20} /></button>
                    <button onClick={onNextStep} disabled={isFinished || !startNode || !endNode} title="Next Step" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiSkipForward size={20} /></button>
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

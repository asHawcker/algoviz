import React, { useState } from 'react';
import type { TreeNode, AnimationState } from './useHeap';

interface HeapVisualizerProps {
    heap: number[];
    nodes: Map<number, TreeNode>;
    speed: number;
    statusText: string;
    extractedValue: number | null;
    animationState: AnimationState;
    isAnimating: boolean;
    insert: (value: number) => Promise<void>;
    extract: () => Promise<void>;
    buildHeap: () => Promise<void>;
    reset: () => void;
    setSpeed: (speed: number) => void;
    heapTypeName: 'Min' | 'Max';
}

const HeapVisualizer: React.FC<HeapVisualizerProps> = ({
    nodes, speed, statusText, extractedValue, animationState, isAnimating,
    insert, extract, buildHeap, reset, setSpeed, heapTypeName
}) => {
    const [inputValue, setInputValue] = useState('');

    const handleAddNode = () => {
        const value = parseInt(inputValue, 10);
        if (!isNaN(value) && value >= 1 && value <= 99) {
            insert(value);
            setInputValue('');
        } else {
            alert('Please enter a number between 1 and 99.');
        }
    };

    const handleInputKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAddNode();
        }
    }

    const getNodeColor = (idx: number) => {
        if (animationState.swapping.includes(idx)) return '#ef4444'; // red-500
        if (animationState.comparing.includes(idx)) return '#facc15'; // yellow-400
        if (animationState.justAdded === idx) return '#4ade80'; // green-400 (flash)
        return '#06b6d4'; // cyan-500
    };

    const getTextcolor = (idx: number) => {
        if (animationState.swapping.includes(idx) || animationState.comparing.includes(idx)) return 'black';
        return 'white';
    }

    return (
        <div className="flex flex-col h-full">
            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 p-2 bg-gray-700 rounded-md flex-wrap">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    <input
                        type="number"
                        min="1" max="99"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleInputKeydown}
                        disabled={isAnimating}
                        className="w-24 p-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="1-99"
                    />
                    <button onClick={handleAddNode} disabled={isAnimating} className="px-3 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 disabled:bg-gray-500 transition-colors">Add</button>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button onClick={extract} disabled={isAnimating} className="px-3 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-500 disabled:bg-gray-500 transition-colors">Extract {heapTypeName}</button>
                    <button onClick={buildHeap} disabled={isAnimating} className="px-3 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 disabled:bg-gray-500 transition-colors">Build Random</button>
                    <button onClick={reset} disabled={isAnimating} className="px-3 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 disabled:bg-gray-800 transition-colors">Clear</button>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm">Speed</span>
                    <input type="range" min="50" max="800" step="50" value={850 - speed} onChange={(e) => setSpeed(850 - Number(e.target.value))} className="w-24 md:w-32 cursor-pointer" />
                </div>
            </div>

            {/* Main Visualization Area */}
            <div className="flex-grow flex items-center justify-center bg-gray-900 rounded-md overflow-hidden p-4 min-h-[350px]">
                <svg width="100%" height="100%" viewBox="0 0 800 300">
                    {Array.from(nodes.values()).map(node => {
                        const parentIndex = Math.floor((node.id - 1) / 2);
                        if (node.id > 0 && nodes.has(parentIndex)) {
                            const parent = nodes.get(parentIndex)!;
                            return <line key={`line-${parent.id}-${node.id}`} x1={parent.x} y1={parent.y} x2={node.x} y2={node.y} stroke="#4b5563" strokeWidth="2" />;
                        }
                        return null;
                    })}
                    {Array.from(nodes.values()).map(node => (
                        <g key={`node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
                            <circle r="20" fill={getNodeColor(node.id)} stroke="#1f2937" strokeWidth="3" className={`transition-colors duration-200 ${animationState.justAdded === node.id ? 'animate-pulse' : ''}`}/>
                            <text textAnchor="middle" dy=".3em" fill={getTextcolor(node.id)} fontSize="16" fontWeight="bold">{node.value}</text>
                        </g>
                    ))}
                </svg>
            </div>
             {/* Status Pane */}
            <div className="mt-4 w-full flex-shrink-0 flex items-center justify-between gap-4">
                <div className="text-center font-mono text-cyan-400 min-h-[1.25rem] flex-grow">{statusText}</div>
                <div className="flex flex-col items-center bg-gray-900 p-2 rounded-md min-w-[120px]">
                    <span className="text-sm text-gray-400 font-semibold">Extracted</span>
                    <div className="w-14 h-14 mt-1 flex items-center justify-center text-xl font-bold rounded-md bg-orange-600/50 text-white">
                        {extractedValue !== null ? extractedValue : '-'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeapVisualizer;
import React from 'react';
import { FiPlay, FiPause, FiSkipForward } from 'react-icons/fi';
import type { TreeNode, TreeType, TraversalState } from './useTreeTraversal';
import { NODE_RADIUS, Y_SPACING, X_SPACING, NULL_CHILD_Y_FACTOR, NULL_CHILD_X_FACTOR } from './useTreeTraversal';

interface TreeVisualizerProps {
  nodes: Map<number, TreeNode>;
  rootId: number | null;
  svgSize: { width: number; height: number };
  treeType: TreeType;
  traversalState: TraversalState;
  traversedOutput: number[];
  statusText: string;
  isTraversing: boolean;
  isPaused: boolean;
  isComplete: boolean;
  speed: number;
  handlePlay: () => void;
  handlePause: () => void;
  handleNextStep: () => void;
  handleTreeTypeToggle: () => void;
  handleSpeedChange: (speed: number) => void;
  reset: () => void;
  dataStructureName: 'Stack' | 'Queue';
}

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({
  nodes, rootId, svgSize, treeType, traversalState, traversedOutput, statusText,
  isTraversing, isPaused, isComplete, speed,
  handlePlay, handlePause, handleNextStep, handleTreeTypeToggle, handleSpeedChange, reset,
  dataStructureName,
}) => {

  const getNodeColor = (nodeId: number) => {
    if (isComplete || traversalState.visitedIds.has(nodeId)) return '#22c55e'; // green-500
    if (traversalState.stack.includes(nodeId)) return '#3b82f6'; // blue-500
    if (traversalState.queue.includes(nodeId)) return '#f59e0b'; // amber-500
    if (nodeId === traversalState.currentNodeId && dataStructureName === 'Queue') return '#22c55e';
    if (nodeId === rootId) return '#a855f7'; // purple-500
    return '#06b6d4'; // cyan-500
  };

  const getArrowPosition = () => {
    const { currentNodeId, parentOfCurrent, directionFromParent } = traversalState;
    if ((isComplete || (!isTraversing && isPaused)) && dataStructureName === 'Stack') return null;
    if (!isTraversing && rootId !== null && !isComplete) {
        const node = nodes.get(currentNodeId ?? rootId);
        if (node) return { x: node.x, y: node.y - NODE_RADIUS - 25 };
    }
    if (currentNodeId !== null) {
        const node = nodes.get(currentNodeId);
        if (!node) return null;
        return { x: node.x, y: node.y - NODE_RADIUS - 25 };
    }
    if (parentOfCurrent !== null && directionFromParent) {
        const parentNode = nodes.get(parentOfCurrent);
        if (!parentNode) return null;
        const nullChildY = parentNode.y + Y_SPACING * NULL_CHILD_Y_FACTOR;
        const nullChildXOffset = X_SPACING * NULL_CHILD_X_FACTOR;
        const nullX = directionFromParent === 'left' ? parentNode.x - nullChildXOffset : parentNode.x + nullChildXOffset;
        return { x: nullX, y: nullChildY - 20 };
    }
    return null;
  };
  const arrowPos = getArrowPosition();

  const dataStructure = dataStructureName === 'Stack' ? traversalState.stack : traversalState.queue;

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 p-2 bg-gray-700 rounded-md flex-wrap">
        <div className="flex items-center space-x-4">
          <button onClick={reset} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors"> New Tree </button>
          <div className="flex items-center space-x-2 text-white">
            <span className="text-sm font-medium">Random</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={treeType === 'BST'} onChange={handleTreeTypeToggle} className="sr-only peer" disabled={isTraversing} />
              <div className="w-11 h-6 bg-purple-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
            <span className="text-sm font-medium">BST</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap justify-center">
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm">Speed</span>
            <input type="range" min="50" max="1000" step="50" value={1050 - speed} onChange={(e) => handleSpeedChange(1050 - Number(e.target.value))} disabled={isTraversing && !isPaused} className="w-24 md:w-32 cursor-pointer"/>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handlePlay} disabled={isTraversing && !isPaused} title={isComplete ? "Run Again" : "Play"} className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiPlay size={20} /></button>
            <button onClick={handlePause} disabled={!isTraversing || isPaused || isComplete} title="Pause" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiPause size={20} /></button>
            <button onClick={handleNextStep} disabled={isComplete} title="Next Step" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiSkipForward size={20} /></button>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 items-center justify-center mb-2 text-sm text-gray-300">
        <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>Root</div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>In Stack</div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>In Queue</div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>Visited</div>
        {dataStructureName === 'Stack' && <div className="flex items-center text-orange-500 font-bold mr-2">↓</div>}
        {dataStructureName === 'Stack' ? 'Current Pointer' : 'Current (Dequeued)'}
      </div>
      
      {/* Main Visualization Area */}
      <div className="flex-grow flex flex-col lg:flex-row gap-4 min-h-0">
        <div className="w-full lg:w-48 flex-shrink-0 bg-gray-900 p-2 rounded-md flex flex-col">
            <h3 className="text-center text-gray-400 font-bold mb-2 flex-shrink-0">{dataStructureName}</h3>
            <div className="flex-grow overflow-y-auto">
                <div className="flex flex-row-reverse items-center justify-end flex-wrap-reverse gap-2 p-1 lg:flex-col-reverse lg:items-stretch lg:justify-start lg:flex-nowrap h-full">
                    {dataStructure.map((nodeId, index) => {
                        const node = nodes.get(nodeId);
                        const bgColor = dataStructureName === 'Stack' ? 'bg-blue-500' : 'bg-amber-500';
                        return (
                            <div key={`${nodeId}-${index}`} title={`Value: ${node?.value}`} className={`w-12 h-12 lg:w-full flex items-center justify-center text-sm font-bold rounded-md ${bgColor} text-black flex-shrink-0`}>
                                {node?.value}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        <div className="flex-grow flex items-start justify-center bg-gray-900 rounded-md overflow-auto p-4">
            <svg width={svgSize.width} height={svgSize.height} className="max-w-none">
            {Array.from(nodes.values()).map(node => (
                <g key={`lines-for-${node.id}`}>
                    {node.left !== null && nodes.has(node.left) && <line x1={node.x} y1={node.y} x2={nodes.get(node.left)!.x} y2={nodes.get(node.left)!.y} stroke="gray" strokeWidth="2" />}
                    {node.right !== null && nodes.has(node.right) && <line x1={node.x} y1={node.y} x2={nodes.get(node.right)!.x} y2={nodes.get(node.right)!.y} stroke="gray" strokeWidth="2" />}
                    {node.left === null && <line x1={node.x} y1={node.y} x2={node.x - NULL_CHILD_X_FACTOR * X_SPACING} y2={node.y + NULL_CHILD_Y_FACTOR * Y_SPACING - 5} stroke="gray" strokeWidth="1.5" strokeDasharray="3 3" />}
                    {node.right === null && <line x1={node.x} y1={node.y} x2={node.x + NULL_CHILD_X_FACTOR * X_SPACING} y2={node.y + NULL_CHILD_Y_FACTOR * Y_SPACING - 5} stroke="gray" strokeWidth="1.5" strokeDasharray="3 3" />}
                </g>
            ))}
            {Array.from(nodes.values()).map(node => (
                <g key={`null-text-for-${node.id}`}>
                    {node.left === null && <text x={node.x - NULL_CHILD_X_FACTOR * X_SPACING} y={node.y + NULL_CHILD_Y_FACTOR * Y_SPACING} textAnchor="middle" fill="#6b7280" fontSize="14" fontStyle="italic">NULL</text>}
                    {node.right === null && <text x={node.x + NULL_CHILD_X_FACTOR * X_SPACING} y={node.y + NULL_CHILD_Y_FACTOR * Y_SPACING} textAnchor="middle" fill="#6b7280" fontSize="14" fontStyle="italic">NULL</text>}
                </g>
            ))}
            {arrowPos && dataStructureName === 'Stack' && (
                 <g transform={`translate(${arrowPos.x}, ${arrowPos.y})`} className="transition-all duration-300" style={{ transitionProperty: 'transform' }}>
                    <path d="M 0 15 L -6 5 L 6 5 Z" fill="#f97316" /> 
                    <text textAnchor="middle" dy="-2" fill="#f97316" fontSize="12" fontWeight="bold">current</text>
                </g>
            )}
            {Array.from(nodes.values()).map(node => (
                <g key={`node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
                <circle r={NODE_RADIUS} fill={getNodeColor(node.id)} className="transition-colors duration-300" stroke="#1f2937" strokeWidth="2" />
                <text textAnchor="middle" dy=".3em" fill="black" fontSize="14" fontWeight="bold">{node.value}</text>
                </g>
            ))}
            </svg>
        </div>
      </div>
      
      {/* Output Pane */}
      <div className="mt-4 w-full flex-shrink-0">
        <div className="text-center font-mono text-cyan-400 min-h-[1.25rem] mb-2">{statusText}</div>
        <div className="flex flex-wrap items-center justify-center gap-2 bg-gray-900 p-2 rounded-md min-h-[4.5rem]">
          {traversedOutput.map((value, index) => (
            <div key={index} className="w-12 h-12 flex items-center justify-center text-lg font-bold rounded-md bg-green-500 text-black">
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TreeVisualizer;

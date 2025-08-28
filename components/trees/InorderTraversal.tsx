import React, { useState, useEffect, useCallback } from 'react';
import { FiPlay, FiPause, FiSkipForward } from 'react-icons/fi';

// --- TYPES ---
type TreeNode = {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  x: number;
  y: number;
};

type TraversalState = {
  stack: number[];
  currentNodeId: number | null;
  visitedIds: Set<number>;
  parentOfCurrent: number | null;
  directionFromParent: 'left' | 'right' | null;
};

type TreeType = 'RANDOM' | 'BST';

// --- CONSTANTS ---
const NODE_COUNT: number = 9;
const VALUE_MIN = 1;
const VALUE_MAX = 99;
const NODE_RADIUS = 18;
const Y_SPACING = 65;
const X_SPACING = NODE_RADIUS * 2 + 30; // Increased spacing
const DEFAULT_SPEED = 500;
const NULL_CHILD_Y_FACTOR = 0.7;
const NULL_CHILD_X_FACTOR = 0.6;


// --- HELPER FUNCTIONS ---
const generateTree = (treeType: TreeType): { nodes: Map<number, TreeNode>, rootId: number | null, width: number, height: number } => {
  if (NODE_COUNT <= 0) return { nodes: new Map(), rootId: null, width: 0, height: 0 };

  const nodes = new Map<number, TreeNode>();
  let rootId: number | null = null;
  const values = new Set<number>();
  while (values.size < NODE_COUNT) {
    values.add(Math.floor(Math.random() * (VALUE_MAX - VALUE_MIN + 1)) + VALUE_MIN);
  }
  const valueArray = Array.from(values);

  if (treeType === 'BST') {
    valueArray.sort((a,b) => a-b); // Helps create a more balanced BST
    const buildBalancedBst = (arr: number[], start: number, end: number, idCounter: {val: number}): number | null => {
        if (start > end) return null;
        const mid = Math.floor((start + end) / 2);
        const nodeId = idCounter.val++;
        
        const newNode: TreeNode = { id: nodeId, value: arr[mid], left: null, right: null, x: 0, y: 0 };
        nodes.set(nodeId, newNode);

        newNode.left = buildBalancedBst(arr, start, mid - 1, idCounter);
        newNode.right = buildBalancedBst(arr, mid + 1, end, idCounter);
        
        return nodeId;
    }
    rootId = buildBalancedBst(valueArray, 0, valueArray.length - 1, {val: 0});
  } else { // RANDOM tree
    const nodeIds = Array.from({ length: NODE_COUNT }, (_, i) => i);
    const shuffledValues = [...valueArray].sort(() => Math.random() - 0.5);
    nodeIds.forEach(id => {
      nodes.set(id, { id, value: shuffledValues[id], left: null, right: null, x: 0, y: 0 });
    });

    if (NODE_COUNT > 0) {
        rootId = 0;
        const availableSlots: {parentId: number, side: 'left' | 'right'}[] = [{parentId: 0, side: 'left'}, {parentId: 0, side: 'right'}];
        
        for (let i = 1; i < NODE_COUNT; i++) {
            if (availableSlots.length === 0) break;
            const slotIndex = Math.floor(Math.random() * availableSlots.length);
            const {parentId, side} = availableSlots.splice(slotIndex, 1)[0];
            const parentNode = nodes.get(parentId)!;

            if (side === 'left') parentNode.left = i;
            else parentNode.right = i;

            availableSlots.push({parentId: i, side: 'left'});
            availableSlots.push({parentId: i, side: 'right'});
        }
    }
  }
  
  // --- Calculate Node Positions ---
  let finalWidth = 0;
  let finalHeight = 0;
  let maxNodeY = 0;

  const setYAndDepth = (nodeId: number | null, depth: number) => {
      if (nodeId === null) return;
      const node = nodes.get(nodeId)!;
      node.y = depth * Y_SPACING + Y_SPACING + NODE_RADIUS;
      maxNodeY = Math.max(maxNodeY, node.y);
      setYAndDepth(node.left, depth + 1);
      setYAndDepth(node.right, depth + 1);
  };
  setYAndDepth(rootId, 0);

  if (maxNodeY > 0) {
      // Ensure height accounts for the NULL children of the deepest nodes.
      finalHeight = maxNodeY + Y_SPACING * NULL_CHILD_Y_FACTOR + 20; // 20px padding for text
  }
  
  const X_OFFSET = X_SPACING * 0.7; // Add horizontal padding to prevent clipping on the left.
  let currentX = 0;
  const setXRecursive = (nodeId: number | null) => {
      if (nodeId === null) return;
      const node = nodes.get(nodeId)!;
      setXRecursive(node.left);
      node.x = X_OFFSET + currentX * X_SPACING + X_SPACING / 2;
      currentX++;
      finalWidth = Math.max(finalWidth, node.x + X_SPACING); // Keep original width logic which adds padding
      setXRecursive(node.right);
  };
  setXRecursive(rootId);

  return { nodes, rootId, width: finalWidth, height: finalHeight };
};


// --- COMPONENT ---
const InorderTraversal: React.FC = () => {
  const [nodes, setNodes] = useState<Map<number, TreeNode>>(new Map());
  const [rootId, setRootId] = useState<number | null>(null);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });
  const [treeType, setTreeType] = useState<TreeType>('BST');
  
  const [traversalState, setTraversalState] = useState<TraversalState>({ stack: [], currentNodeId: null, visitedIds: new Set(), parentOfCurrent: null, directionFromParent: null });
  const [traversedOutput, setTraversedOutput] = useState<number[]>([]);
  const [statusText, setStatusText] = useState('');
  
  const [isTraversing, setIsTraversing] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);

  const reset = useCallback(() => {
    setIsTraversing(false);
    setIsPaused(true);
    setIsComplete(false);
    setTraversedOutput([]);
    setStatusText('Ready to traverse. Click "Play" or "Next Step" to begin.');
    const { nodes: newNodes, rootId: newRootId, width, height } = generateTree(treeType);
    setNodes(newNodes);
    setRootId(newRootId);
    setSvgSize({ width, height });
    setTraversalState({ stack: [], currentNodeId: newRootId, visitedIds: new Set(), parentOfCurrent: null, directionFromParent: null });
  }, [treeType]);

  useEffect(() => {
    reset();
  }, [reset]);

  const performStep = useCallback(() => {
    if (isComplete) return;

    const { currentNodeId, stack, visitedIds } = traversalState;
    
    if (currentNodeId !== null) {
      const node = nodes.get(currentNodeId)!;
      setStatusText(`Current: ${node.value}. Pushing to stack, moving to left child.`);
      setTraversalState({
        ...traversalState,
        stack: [...stack, currentNodeId],
        currentNodeId: node.left,
        parentOfCurrent: currentNodeId,
        directionFromParent: 'left',
      });
      return;
    }
    
    if (stack.length > 0) {
      const newStack = [...stack];
      const poppedId = newStack.pop()!;
      const poppedNode = nodes.get(poppedId)!;
      
      setStatusText(`Popped ${poppedNode.value}. Visiting it, moving to right child.`);
      setTraversedOutput(prev => [...prev, poppedNode.value]);
      
      setTraversalState({
        ...traversalState,
        stack: newStack,
        visitedIds: new Set(visitedIds).add(poppedId),
        currentNodeId: poppedNode.right,
        parentOfCurrent: poppedId,
        directionFromParent: 'right',
      });
      return;
    }

    setStatusText('Traversal complete!');
    setIsComplete(true);
    setIsTraversing(false);
    setIsPaused(true);
    setTraversalState({
        ...traversalState,
        parentOfCurrent: null,
        directionFromParent: null,
    });
  }, [nodes, traversalState, isComplete]);

  useEffect(() => {
    let timerId: number | undefined;
    if (isTraversing && !isPaused && !isComplete) {
      timerId = window.setTimeout(performStep, speed);
    }
    return () => clearTimeout(timerId);
  }, [isTraversing, isPaused, isComplete, performStep, speed]);
  
  const handlePlay = () => {
    if (isComplete) {
      reset();
      setTimeout(() => {
        setIsTraversing(true);
        setIsPaused(false);
      }, 50);
    } else {
      setIsTraversing(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => setIsPaused(true);

  const handleNextStep = () => {
    setIsPaused(true);
    if (!isTraversing && !isComplete) {
      setIsTraversing(true);
    }
    performStep();
  };

  const handleTreeTypeToggle = () => {
    setTreeType(prev => (prev === 'BST' ? 'RANDOM' : 'BST'));
  };
  
  const getNodeColor = (nodeId: number) => {
    if (isComplete || traversalState.visitedIds.has(nodeId)) return '#22c55e'; // green-500
    if (traversalState.stack.includes(nodeId)) return '#3b82f6'; // blue-500
    if (nodeId === rootId) return '#a855f7'; // purple-500
    return '#06b6d4'; // cyan-500
  };

  const getArrowPosition = () => {
      const { currentNodeId, parentOfCurrent, directionFromParent } = traversalState;

      if (!isTraversing && rootId !== null && !isComplete) {
          const node = nodes.get(currentNodeId ?? rootId);
          if (node) return { x: node.x, y: node.y - NODE_RADIUS - 25 };
      }

      if (isComplete || (!isTraversing && isPaused)) return null;
      
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
          const nullX = directionFromParent === 'left'
              ? parentNode.x - nullChildXOffset
              : parentNode.x + nullChildXOffset;
          
          return { x: nullX, y: nullChildY - 20 };
      }
      return null;
  };
  const arrowPos = getArrowPosition();


  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 p-2 bg-gray-700 rounded-md flex-wrap">
        <div className="flex items-center space-x-4">
          <button onClick={reset} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors">
            New Tree
          </button>
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
                <input type="range" min="50" max="1000" step="50" value={1050 - speed} onChange={(e) => setSpeed(1050 - Number(e.target.value))} disabled={isTraversing && !isPaused} className="w-24 md:w-32 cursor-pointer"/>
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
        <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>Visited</div>
        <div className="flex items-center text-orange-500 font-bold mr-2">↓</div>Current Pointer
      </div>
      
      {/* Main Visualization Area */}
      <div className="flex-grow flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Stack Visualizer */}
        <div className="w-full lg:w-48 flex-shrink-0 bg-gray-900 p-2 rounded-md flex flex-col">
            <h3 className="text-center text-gray-400 font-bold mb-2 flex-shrink-0">Stack</h3>
            <div className="flex-grow overflow-y-auto">
                <div className="flex flex-row-reverse items-center justify-end flex-wrap-reverse gap-2 p-1 lg:flex-col-reverse lg:items-stretch lg:justify-start lg:flex-nowrap h-full">
                    {traversalState.stack.map((nodeId, index) => {
                        const node = nodes.get(nodeId);
                        return (
                            <div key={`${nodeId}-${index}`} title={`Value: ${node?.value}`} className="w-12 h-12 lg:w-full flex items-center justify-center text-sm font-bold rounded-md bg-blue-500 text-black flex-shrink-0">
                                {node?.value}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Tree Visualizer */}
        <div className="flex-grow flex items-start justify-center bg-gray-900 rounded-md overflow-auto p-4">
            <svg width={svgSize.width} height={svgSize.height} className="max-w-none">
            {/* Lines */}
            {Array.from(nodes.values()).map(node => {
                const leftChild = node.left !== null ? nodes.get(node.left) : null;
                const rightChild = node.right !== null ? nodes.get(node.right) : null;
                const nullChildY = node.y + Y_SPACING * NULL_CHILD_Y_FACTOR;
                const nullChildXOffset = X_SPACING * NULL_CHILD_X_FACTOR;

                return (
                <g key={`lines-for-${node.id}`}>
                    {leftChild && <line x1={node.x} y1={node.y} x2={leftChild.x} y2={leftChild.y} stroke="gray" strokeWidth="2" />}
                    {rightChild && <line x1={node.x} y1={node.y} x2={rightChild.x} y2={rightChild.y} stroke="gray" strokeWidth="2" />}
                    {node.left === null && <line x1={node.x} y1={node.y} x2={node.x-nullChildXOffset} y2={nullChildY - 5} stroke="gray" strokeWidth="1.5" strokeDasharray="3 3" />}
                    {node.right === null && <line x1={node.x} y1={node.y} x2={node.x+nullChildXOffset} y2={nullChildY - 5} stroke="gray" strokeWidth="1.5" strokeDasharray="3 3" />}
                </g>
                )
            })}
            {/* Null Text */}
             {Array.from(nodes.values()).map(node => {
                const nullChildY = node.y + Y_SPACING * NULL_CHILD_Y_FACTOR;
                const nullChildXOffset = X_SPACING * NULL_CHILD_X_FACTOR;
                return (
                    <g key={`null-text-for-${node.id}`}>
                        {node.left === null && <text x={node.x - nullChildXOffset} y={nullChildY} textAnchor="middle" fill="#6b7280" fontSize="14" fontStyle="italic">NULL</text>}
                        {node.right === null && <text x={node.x + nullChildXOffset} y={nullChildY} textAnchor="middle" fill="#6b7280" fontSize="14" fontStyle="italic">NULL</text>}
                    </g>
                )
            })}
            {/* Arrow */}
            {arrowPos && (
                 <g transform={`translate(${arrowPos.x}, ${arrowPos.y})`} className="transition-all duration-300" style={{ transitionProperty: 'transform' }}>
                    <path d="M 0 15 L -6 5 L 6 5 Z" fill="#f97316" /> 
                    <text textAnchor="middle" dy="-2" fill="#f97316" fontSize="12" fontWeight="bold">current</text>
                </g>
            )}
            {/* Nodes */}
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
        <div className="text-center font-mono text-cyan-400 min-h-[1.25rem] mb-2">
            {statusText}
        </div>
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

export default InorderTraversal;
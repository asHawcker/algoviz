import { useState, useCallback, useEffect } from 'react';

// --- TYPES ---
export type TreeNode = {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  x: number;
  y: number;
};

export type TreeType = 'RANDOM' | 'BST';
export type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'bfs';

export type TraversalState = {
  // Common
  visitedIds: Set<number>;
  currentNodeId: number | null;
  parentOfCurrent: number | null;
  directionFromParent: 'left' | 'right' | null;
  // DFS-like
  stack: number[];
  lastVisitedNodeId: number | null;
  // BFS-like
  queue: number[];
};


// --- CONSTANTS ---
const NODE_COUNT: number = 9;
const VALUE_MIN = 1;
const VALUE_MAX = 99;
export const NODE_RADIUS = 18;
export const Y_SPACING = 65;
export const X_SPACING = NODE_RADIUS * 2 + 30;
const DEFAULT_SPEED = 500;
export const NULL_CHILD_Y_FACTOR = 0.7;
export const NULL_CHILD_X_FACTOR = 0.6;


// --- HELPER: Tree Generation ---
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
      valueArray.sort((a,b) => a-b);
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
              if (side === 'left') parentNode.left = i; else parentNode.right = i;
              availableSlots.push({parentId: i, side: 'left'}, {parentId: i, side: 'right'});
          }
      }
    }
    
    let finalWidth = 0, finalHeight = 0, maxNodeY = 0;
    const setYAndDepth = (nodeId: number | null, depth: number) => {
        if (nodeId === null) return;
        const node = nodes.get(nodeId)!;
        node.y = depth * Y_SPACING + Y_SPACING + NODE_RADIUS;
        maxNodeY = Math.max(maxNodeY, node.y);
        setYAndDepth(node.left, depth + 1);
        setYAndDepth(node.right, depth + 1);
    };
    setYAndDepth(rootId, 0);
    if (maxNodeY > 0) finalHeight = maxNodeY + Y_SPACING * NULL_CHILD_Y_FACTOR + 20;
    
    const X_OFFSET = X_SPACING * 0.7;
    let currentX = 0;
    const setXRecursive = (nodeId: number | null) => {
        if (nodeId === null) return;
        const node = nodes.get(nodeId)!;
        setXRecursive(node.left);
        node.x = X_OFFSET + currentX * X_SPACING + X_SPACING / 2;
        currentX++;
        finalWidth = Math.max(finalWidth, node.x + X_SPACING);
        setXRecursive(node.right);
    };
    setXRecursive(rootId);
  
    return { nodes, rootId, width: finalWidth, height: finalHeight };
};

// --- THE HOOK ---
const useTreeTraversal = (traversalType: TraversalType) => {
  const [nodes, setNodes] = useState<Map<number, TreeNode>>(new Map());
  const [rootId, setRootId] = useState<number | null>(null);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });
  const [treeType, setTreeType] = useState<TreeType>('BST');
  
  const [traversalState, setTraversalState] = useState<TraversalState>({ stack: [], queue: [], currentNodeId: null, visitedIds: new Set(), parentOfCurrent: null, directionFromParent: null, lastVisitedNodeId: null });
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

    const initialState: TraversalState = {
        stack: [],
        queue: newRootId !== null ? [newRootId] : [],
        currentNodeId: newRootId,
        visitedIds: new Set(),
        parentOfCurrent: null,
        directionFromParent: null,
        lastVisitedNodeId: null
    };
    setTraversalState(initialState);
  }, [treeType]);

  useEffect(() => {
    reset();
  }, [reset]);

  const performStep = useCallback(() => {
    if (isComplete) return;
    const { visitedIds } = traversalState;

    const completeTraversal = () => {
        setStatusText('Traversal complete!');
        setIsComplete(true);
        setIsTraversing(false);
        setIsPaused(true);
        setTraversalState(prev => ({ ...prev, parentOfCurrent: null, directionFromParent: null }));
    };

    switch(traversalType) {
        case 'inorder': {
            const { currentNodeId, stack } = traversalState;
            if (currentNodeId !== null) {
                const node = nodes.get(currentNodeId)!;
                setStatusText(`Current: ${node.value}. Push to stack, move left.`);
                setTraversalState(prev => ({...prev, stack: [...prev.stack, currentNodeId], currentNodeId: node.left, parentOfCurrent: currentNodeId, directionFromParent: 'left' }));
            } else if (stack.length > 0) {
                const newStack = [...stack];
                const poppedId = newStack.pop()!;
                const poppedNode = nodes.get(poppedId)!;
                setStatusText(`Popped ${poppedNode.value}. Visit, move right.`);
                setTraversedOutput(prev => [...prev, poppedNode.value]);
                setTraversalState(prev => ({...prev, stack: newStack, visitedIds: new Set(prev.visitedIds).add(poppedId), currentNodeId: poppedNode.right, parentOfCurrent: poppedId, directionFromParent: 'right'}));
            } else {
                completeTraversal();
            }
            break;
        }
        case 'preorder': {
            const { currentNodeId, stack } = traversalState;
             if (currentNodeId !== null) {
                const node = nodes.get(currentNodeId)!;
                setStatusText(`Visit ${node.value}, push to stack, move left.`);
                setTraversedOutput(prev => [...prev, node.value]);
                setTraversalState(prev => ({ ...prev, visitedIds: new Set(prev.visitedIds).add(currentNodeId), stack: [...prev.stack, currentNodeId], currentNodeId: node.left, parentOfCurrent: currentNodeId, directionFromParent: 'left'}));
            } else if (stack.length > 0) {
                const newStack = [...stack];
                const poppedId = newStack.pop()!;
                const poppedNode = nodes.get(poppedId)!;
                setStatusText(`Popped ${poppedNode.value}. Move right.`);
                setTraversalState(prev => ({ ...prev, stack: newStack, currentNodeId: poppedNode.right, parentOfCurrent: poppedId, directionFromParent: 'right'}));
            } else {
                completeTraversal();
            }
            break;
        }
        case 'postorder': {
            const { currentNodeId, stack, lastVisitedNodeId } = traversalState;
            if (currentNodeId !== null) {
                const node = nodes.get(currentNodeId)!;
                setStatusText(`Current: ${node.value}. Push, move left.`);
                setTraversalState(prev => ({ ...prev, stack: [...prev.stack, currentNodeId], currentNodeId: node.left, parentOfCurrent: currentNodeId, directionFromParent: 'left' }));
            } else if (stack.length > 0) {
                const peekNodeId = stack[stack.length - 1];
                const peekNode = nodes.get(peekNodeId)!;
                if (peekNode.right !== null && peekNode.right !== lastVisitedNodeId) {
                    setStatusText(`Returned to ${peekNode.value}. Move right.`);
                    setTraversalState(prev => ({ ...prev, currentNodeId: peekNode.right, parentOfCurrent: peekNodeId, directionFromParent: 'right' }));
                } else {
                    const newStack = [...stack]; newStack.pop();
                    setStatusText(`Visit ${peekNode.value}.`);
                    setTraversedOutput(prev => [...prev, peekNode.value]);
                    setTraversalState(prev => ({...prev, stack: newStack, visitedIds: new Set(prev.visitedIds).add(peekNodeId), currentNodeId: null, lastVisitedNodeId: peekNodeId, parentOfCurrent: null, directionFromParent: null}));
                }
            } else {
                completeTraversal();
            }
            break;
        }
        case 'bfs': {
            const { queue } = traversalState;
            if (queue.length === 0) {
                completeTraversal();
            } else {
                const newQueue = [...queue];
                const currentId = newQueue.shift()!;
                const node = nodes.get(currentId)!;
                if (node.left !== null) newQueue.push(node.left);
                if (node.right !== null) newQueue.push(node.right);
                
                setStatusText(`Visited ${node.value}. Enqueued children.`);
                setTraversedOutput(prev => [...prev, node.value]);
                setTraversalState(prev => ({ ...prev, queue: newQueue, visitedIds: new Set(prev.visitedIds).add(currentId), currentNodeId: currentId, parentOfCurrent: null, directionFromParent: null }));
            }
            break;
        }
    }
  }, [nodes, traversalState, isComplete, traversalType]);

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
      setTimeout(() => { setIsTraversing(true); setIsPaused(false); }, 50);
    } else {
      setIsTraversing(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => setIsPaused(true);
  const handleNextStep = () => {
    setIsPaused(true);
    if (!isTraversing && !isComplete) setIsTraversing(true);
    performStep();
  };
  const handleTreeTypeToggle = () => setTreeType(prev => (prev === 'BST' ? 'RANDOM' : 'BST'));
  const handleSpeedChange = (newSpeed: number) => setSpeed(newSpeed);

  return {
    // State
    nodes, rootId, svgSize, treeType, traversalState, traversedOutput, statusText, isTraversing, isPaused, isComplete, speed,
    // Handlers
    handlePlay, handlePause, handleNextStep, handleTreeTypeToggle, handleSpeedChange, reset
  };
};

export default useTreeTraversal;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SortControls from './SortControls';
import { useSortingTimer } from '../../hooks/useSortingTimer';

const MIN_VALUE = 10;
const MAX_VALUE = 100;
const DEFAULT_SPEED = 300;
const MAX_SIZE = 20;
const X_SPACING = 45;

// --- TYPES ---
type HeapSortPhase = 'IDLE' | 'BUILDING' | 'SIFTING' | 'SWAPPING' | 'SORTING' | 'DONE';
type SiftContext = { from: 'BUILDING' | 'SORTING', index: number, heapSize: number, parent: number, largest: number };

interface TreeNode {
    id: number;
    value: number;
    x: number;
    y: number;
}

// --- HEAP TREE VISUALIZER COMPONENT ---
interface HeapTreeProps {
    nodes: Map<number, TreeNode>;
    array: number[];
    heapSize: number;
    comparing: number[];
    swapping: number[];
    sortedIndices: Set<number>;
}

const HeapTree: React.FC<HeapTreeProps> = ({ nodes, array, heapSize, comparing, swapping, sortedIndices }) => {
    const getNodeColor = (idx: number) => {
        if (sortedIndices.has(idx)) return '#16a34a'; // green-600
        if (swapping.includes(idx)) return '#ef4444'; // red-500
        if (comparing.includes(idx)) return '#facc15'; // yellow-400
        if (idx >= heapSize) return '#4b5563'; // gray-600 (not in heap)
        return '#06b6d4'; // cyan-500
    };

    if (nodes.size === 0) return null;

    const VIEWBOX_WIDTH = MAX_SIZE * X_SPACING;

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${VIEWBOX_WIDTH} 300`}>
            {Array.from(nodes.values()).map(node => {
                const leftChildIndex = 2 * node.id + 1;
                const rightChildIndex = 2 * node.id + 2;
                return (
                    <g key={`lines-${node.id}`}>
                        {nodes.has(leftChildIndex) && leftChildIndex < heapSize && <line x1={node.x} y1={node.y} x2={nodes.get(leftChildIndex)!.x} y2={nodes.get(leftChildIndex)!.y} stroke="#4b5563" strokeWidth="2" />}
                        {nodes.has(rightChildIndex) && rightChildIndex < heapSize && <line x1={node.x} y1={node.y} x2={nodes.get(rightChildIndex)!.x} y2={nodes.get(rightChildIndex)!.y} stroke="#4b5563" strokeWidth="2" />}
                    </g>
                )
            })}
            {Array.from(nodes.values()).map(node => (
                <g key={`node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
                    <circle r="18" fill={getNodeColor(node.id)} stroke="#1f2937" strokeWidth="3" />
                    <text textAnchor="middle" dy=".3em" fill={comparing.includes(node.id) || swapping.includes(node.id) ? 'black' : 'white'} fontSize="14" fontWeight="bold">{array[node.id]}</text>
                </g>
            ))}
        </svg>
    );
};

// FIX: Added missing generateRandomArray function.
const generateRandomArray = (size: number) => {
    return Array.from({ length: size }, () =>
      Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
    );
  };

// --- MAIN HEAP SORT COMPONENT ---
const HeapSort: React.FC = () => {
    const [array, setArray] = useState<number[]>([]);
    const [arraySize, setArraySize] = useState<number>(12);
    const [isSorting, setIsSorting] = useState<boolean>(false);
    const [isSorted, setIsSorted] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
    
    // Algorithm state
    const [phase, setPhase] = useState<HeapSortPhase>('IDLE');
    const [buildIndex, setBuildIndex] = useState(0); // For initial heap build
    const [sortIndex, setSortIndex] = useState(0); // For sorting down
    const [siftContext, setSiftContext] = useState<SiftContext | null>(null);
    const [sortedIndices, setSortedIndices] = useState<Set<number>>(new Set());
    const [comparing, setComparing] = useState<number[]>([]);
    const [swapping, setSwapping] = useState<number[]>([]);
    const [statusText, setStatusText] = useState('Ready to sort.');

    const resetArray = useCallback(() => {
        setIsSorting(false); setIsSorted(false); setIsPaused(true);
        const newArray = generateRandomArray(arraySize);
        setArray(newArray);
        setPhase('IDLE');
        setBuildIndex(Math.floor(newArray.length / 2) - 1);
        setSortIndex(newArray.length - 1);
        setSiftContext(null);
        setSortedIndices(new Set());
        setComparing([]); setSwapping([]);
        setStatusText('Ready to build the max-heap.');
    }, [arraySize]);

    useEffect(() => { resetArray(); }, [resetArray]);

    const performStep = useCallback(() => {
        let currentArray = [...array];
        
        if (phase === 'IDLE') {
            setPhase('BUILDING');
            return;
        }

        if (phase === 'BUILDING') {
            if (buildIndex < 0) {
                setPhase('SORTING');
                setStatusText('Heap built. Starting sort phase.');
                return;
            }
            setStatusText(`Heapifying subtree at index ${buildIndex}.`);
            setSiftContext({ from: 'BUILDING', index: buildIndex, heapSize: currentArray.length, parent: buildIndex, largest: buildIndex });
            setPhase('SIFTING');
        }

        if (phase === 'SORTING') {
            if (sortIndex <= 0) {
                setSortedIndices(prev => new Set(prev).add(0));
                setPhase('DONE');
                setStatusText('Array is sorted!');
                setIsSorted(true); setIsSorting(false); setIsPaused(true);
                setComparing([]); setSwapping([]);
                return;
            }
            setStatusText(`Swapping max element ${currentArray[0]} with end of heap.`);
            setSwapping([0, sortIndex]);
            setPhase('SWAPPING');
        }

        if (phase === 'SWAPPING') {
            [currentArray[0], currentArray[sortIndex]] = [currentArray[sortIndex], currentArray[0]];
            setArray(currentArray);
            setSortedIndices(prev => new Set(prev).add(sortIndex));
            setSwapping([]);
            
            setStatusText(`Restoring heap property for the root.`);
            setSiftContext({ from: 'SORTING', index: 0, heapSize: sortIndex, parent: 0, largest: 0 });
            setPhase('SIFTING');
        }

        if (phase === 'SIFTING' && siftContext) {
            const { parent, heapSize } = siftContext;
            const left = 2 * parent + 1;
            const right = 2 * parent + 2;
            let largest = parent;

            setComparing([parent, left, right].filter(i => i < heapSize));

            if (left < heapSize && currentArray[left] > currentArray[largest]) largest = left;
            if (right < heapSize && currentArray[right] > currentArray[largest]) largest = right;
            
            if (largest !== parent) {
                [currentArray[parent], currentArray[largest]] = [currentArray[largest], currentArray[parent]];
                setArray(currentArray);
                setStatusText(`Sifting down: Swapped ${currentArray[largest]} and ${currentArray[parent]}.`);
                setSiftContext({ ...siftContext, parent: largest, largest: largest });
            } else {
                setComparing([]);
                if (siftContext.from === 'BUILDING') {
                    setBuildIndex(b => b - 1);
                    setPhase('BUILDING');
                } else { // from 'SORTING'
                    setSortIndex(s => s - 1);
                    setPhase('SORTING');
                }
            }
        }
    }, [array, phase, buildIndex, sortIndex, siftContext]);

    useSortingTimer({ isSorting, isPaused, isFinished: isSorted, speed, performStep });

    const handlePlay = () => { if (isSorted) { resetArray(); setTimeout(() => { setIsSorting(true); setIsPaused(false); }, 50); } else { setIsSorting(true); setIsPaused(false); } };
    const handlePause = () => setIsPaused(true);
    const handleNextStep = () => { setIsPaused(true); if (!isSorting) setIsSorting(true); performStep(); };

    const treeNodes = useMemo(() => {
        const nodes = new Map<number, TreeNode>();
        const Y_SPACING = 60;

        const currentWidth = array.length * X_SPACING;
        const maxWidth = MAX_SIZE * X_SPACING;
        const xOffset = (maxWidth - currentWidth) / 2;

        const positions: number[] = [];
        const calculatePositions = (index: number) => {
            if (index >= array.length) return;
            calculatePositions(2 * index + 1); // Left
            positions.push(index);
            calculatePositions(2 * index + 2); // Right
        };
        calculatePositions(0);

        positions.forEach((nodeIndex, xIndex) => {
            const depth = Math.floor(Math.log2(nodeIndex + 1));
            nodes.set(nodeIndex, {
                id: nodeIndex,
                value: array[nodeIndex],
                x: xOffset + xIndex * X_SPACING + X_SPACING / 2,
                y: depth * Y_SPACING + 30
            });
        });
        return nodes;
    }, [array.length]);

    const getBarColor = (idx: number) => {
        if (isSorted || sortedIndices.has(idx)) return 'bg-green-500';
        if (swapping.includes(idx)) return 'bg-red-500';
        if (comparing.includes(idx)) return 'bg-yellow-400';
        if (siftContext && (idx === siftContext.parent || idx === siftContext.largest)) return 'bg-purple-500';
        return 'bg-gray-500';
    };

    return (
        <div className="flex flex-col h-full">
            <SortControls
                isSorting={isSorting} isPaused={isPaused} isFinished={isSorted}
                arraySize={arraySize} speed={speed}
                onReset={resetArray} onPlay={handlePlay} onPause={handlePause}
                onNextStep={handleNextStep} onSizeChange={setArraySize} onSpeedChange={setSpeed}
                maxSize={MAX_SIZE} minSpeed={100} maxSpeed={1000} speedStep={50}
            />
            
            <div className="flex-grow flex flex-col justify-around gap-2 bg-gray-900 p-2 rounded-md">
                <div className="text-center font-mono text-cyan-400 min-h-[1.25rem]">{statusText}</div>
                
                <div className="flex-grow w-full min-h-[250px] bg-gray-800/50 rounded-md p-2">
                    <HeapTree nodes={treeNodes} array={array} heapSize={sortIndex + 1} comparing={comparing} swapping={swapping} sortedIndices={sortedIndices} />
                </div>
                
                <div className="flex items-end justify-center space-x-1 p-2 min-h-[150px]">
                    {array.map((value, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1 max-w-[2.5rem]">
                            <div className={`w-full rounded-t-sm transition-all duration-200 ${getBarColor(idx)}`} style={{ height: `${value * 1.2}px` }} title={value.toString()}></div>
                            <span className="text-xs mt-1 text-gray-400 hidden sm:inline">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeapSort;

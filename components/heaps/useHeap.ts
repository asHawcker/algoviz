import { useState, useCallback, useMemo } from 'react';

// --- TYPES ---
export type HeapType = 'min' | 'max';
export interface TreeNode {
    id: number;
    value: number;
    x: number;
    y: number;
}
export interface AnimationState {
    comparing: number[];
    swapping: number[];
    justAdded: number | null;
    isAnimating: boolean;
}

// --- CONSTANTS ---
const MIN_VALUE = 1;
const MAX_VALUE = 99;
const MAX_HEAP_SIZE = 15; // Max nodes for visualization clarity (forms a 4-level tree)
const DEFAULT_SPEED = 400;

// --- HELPERS ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateRandomArray = (size: number) => {
    const arr = [];
    while (arr.length < size) {
        const val = Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE;
        if (!arr.includes(val)) {
            arr.push(val);
        }
    }
    return arr;
};

// --- THE HOOK ---
const useHeap = (heapType: HeapType) => {
    const [heap, setHeap] = useState<number[]>([]);
    const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
    const [statusText, setStatusText] = useState('Build a random heap or add a node to start.');
    const [extractedValue, setExtractedValue] = useState<number | null>(null);
    const [animationState, setAnimationState] = useState<AnimationState>({
        comparing: [],
        swapping: [],
        justAdded: null,
        isAnimating: false,
    });
    
    const isAnimating = animationState.isAnimating;

    const compare = (a: number, b: number) => {
        return heapType === 'min' ? a < b : a > b;
    };

    const reset = useCallback(() => {
        setHeap([]);
        setStatusText('Build a random heap or add a node to start.');
        setExtractedValue(null);
        setAnimationState({ comparing: [], swapping: [], justAdded: null, isAnimating: false });
    }, []);

    const buildHeap = useCallback(async () => {
        if (isAnimating) return;
        reset();
        setAnimationState(prev => ({ ...prev, isAnimating: true }));
        const randomArray = generateRandomArray(7);
        setStatusText('Building heap from random array...');
        await sleep(speed);

        let builtHeap: number[] = [];
        for (const val of randomArray) {
            builtHeap.push(val);
            setHeap([...builtHeap]);
            setStatusText(`Adding ${val}...`);
            await sleep(speed);
            
            let i = builtHeap.length - 1;
            while (i > 0) {
                const parentIndex = Math.floor((i - 1) / 2);
                setAnimationState(prev => ({ ...prev, comparing: [i, parentIndex] }));
                await sleep(speed);
                if (compare(builtHeap[i], builtHeap[parentIndex])) {
                    setStatusText(`Bubbling up: Swapping ${builtHeap[i]} with ${builtHeap[parentIndex]}`);
                    setAnimationState(prev => ({ ...prev, swapping: [i, parentIndex] }));
                    await sleep(speed);
                    [builtHeap[i], builtHeap[parentIndex]] = [builtHeap[parentIndex], builtHeap[i]];
                    setHeap([...builtHeap]);
                    setAnimationState(prev => ({ ...prev, swapping: [] }));
                    i = parentIndex;
                } else {
                    break;
                }
            }
            setAnimationState(prev => ({ ...prev, comparing: [] }));
        }
        setStatusText('Heap constructed.');
        setAnimationState(prev => ({ ...prev, isAnimating: false }));
    }, [isAnimating, speed, reset, compare]);

    const insert = useCallback(async (value: number) => {
        if (isAnimating || heap.length >= MAX_HEAP_SIZE) {
             if (heap.length >= MAX_HEAP_SIZE) setStatusText(`Cannot add: Heap is full (max ${MAX_HEAP_SIZE} nodes).`);
            return;
        }
        setAnimationState(prev => ({ ...prev, isAnimating: true }));
        setExtractedValue(null);

        const newHeap = [...heap, value];
        let currentIndex = newHeap.length - 1;
        
        setHeap(newHeap);
        setAnimationState(prev => ({ ...prev, justAdded: currentIndex }));
        setStatusText(`Adding ${value} to the heap.`);
        await sleep(speed);
        setAnimationState(prev => ({ ...prev, justAdded: null }));

        // Bubble up
        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2);
            setAnimationState(prev => ({ ...prev, comparing: [currentIndex, parentIndex] }));
            await sleep(speed);

            if (compare(newHeap[currentIndex], newHeap[parentIndex])) {
                setAnimationState(prev => ({ ...prev, swapping: [currentIndex, parentIndex] }));
                setStatusText(`Bubbling up: Swapping ${newHeap[currentIndex]} with parent ${newHeap[parentIndex]}.`);
                await sleep(speed);
                [newHeap[currentIndex], newHeap[parentIndex]] = [newHeap[parentIndex], newHeap[currentIndex]];
                setHeap([...newHeap]);
                setAnimationState(prev => ({ ...prev, swapping: [] }));
                currentIndex = parentIndex;
            } else {
                setStatusText(`Correct position found for ${value}.`);
                break;
            }
        }
        setAnimationState(prev => ({ ...prev, comparing: [], isAnimating: false }));
        if (currentIndex === 0) setStatusText(`Correct position found for ${value}.`);

    }, [heap, isAnimating, speed, compare]);

    const extract = useCallback(async () => {
        if (isAnimating || heap.length === 0) {
            if (heap.length === 0) setStatusText('Cannot extract: Heap is empty.');
            return;
        }
        setAnimationState(prev => ({ ...prev, isAnimating: true }));
        
        const rootValue = heap[0];
        setExtractedValue(rootValue);
        setStatusText(`Extracting root: ${rootValue}.`);
        await sleep(speed);

        if (heap.length === 1) {
            reset();
            setStatusText(`Extracted ${rootValue}. Heap is now empty.`);
            return;
        }

        const newHeap = [...heap];
        const lastValue = newHeap.pop()!;
        newHeap[0] = lastValue;
        
        setAnimationState(prev => ({ ...prev, swapping: [0, heap.length - 1] }));
        setStatusText(`Replacing root with last element ${lastValue}.`);
        await sleep(speed);
        setHeap(newHeap);
        setAnimationState(prev => ({ ...prev, swapping: [] }));
        await sleep(speed);
        setStatusText(`Sinking down ${lastValue} to restore heap property.`);

        // Sink down
        let currentIndex = 0;
        while (true) {
            let leftChildIndex = 2 * currentIndex + 1;
            let rightChildIndex = 2 * currentIndex + 2;
            let targetIndex = currentIndex;

            setAnimationState(prev => ({ ...prev, comparing: [currentIndex, leftChildIndex, rightChildIndex].filter(i => i < newHeap.length)}));
            await sleep(speed);
            
            if (leftChildIndex < newHeap.length && compare(newHeap[leftChildIndex], newHeap[targetIndex])) {
                targetIndex = leftChildIndex;
            }
            if (rightChildIndex < newHeap.length && compare(newHeap[rightChildIndex], newHeap[targetIndex])) {
                targetIndex = rightChildIndex;
            }

            if (targetIndex !== currentIndex) {
                setAnimationState(prev => ({ ...prev, swapping: [currentIndex, targetIndex] }));
                setStatusText(`Sinking down: Swapping ${newHeap[currentIndex]} with child ${newHeap[targetIndex]}.`);
                await sleep(speed);
                [newHeap[currentIndex], newHeap[targetIndex]] = [newHeap[targetIndex], newHeap[currentIndex]];
                setHeap([...newHeap]);
                setAnimationState(prev => ({ ...prev, swapping: [] }));
                currentIndex = targetIndex;
            } else {
                setStatusText(`Correct position found for ${lastValue}.`);
                break;
            }
        }
        setAnimationState(prev => ({ ...prev, comparing: [], isAnimating: false }));
    }, [heap, isAnimating, speed, reset, compare]);

    const nodes = useMemo(() => {
        const nodeMap = new Map<number, TreeNode>();
        if (heap.length === 0) return nodeMap;

        const Y_SPACING = 70;
        const VIEWBOX_WIDTH = 800;
        
        const levelWidths: number[] = [];
        const maxDepth = Math.floor(Math.log2(heap.length));
        for(let i = 0; i <= maxDepth; i++) {
            levelWidths.push(Math.pow(2, i));
        }

        heap.forEach((value, i) => {
            const depth = Math.floor(Math.log2(i + 1));
            const indexInLevel = i - (Math.pow(2, depth) - 1);
            const numNodesInLevel = Math.pow(2, depth);
            const x = (VIEWBOX_WIDTH / (numNodesInLevel + 1)) * (indexInLevel + 1);
            const y = depth * Y_SPACING + 40;
            nodeMap.set(i, { id: i, value, x, y });
        });
        return nodeMap;
    }, [heap]);

    return {
        heap,
        nodes,
        speed,
        statusText,
        extractedValue,
        animationState,
        isAnimating,
        insert,
        extract,
        buildHeap,
        reset,
        setSpeed,
    };
};

export default useHeap;

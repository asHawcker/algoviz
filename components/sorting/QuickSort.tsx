import React, { useState, useEffect, useCallback } from 'react';
import { FiPlay, FiPause, FiSkipForward } from 'react-icons/fi';

const MIN_VALUE = 10;
const MAX_VALUE = 100;
const DEFAULT_SPEED = 250;

const generateRandomArray = (size: number) => {
  return Array.from({ length: size }, () => 
    Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
  );
};

type QuickSortState = {
  array: number[];
  stack: [number, number][];
  sortedIndices: Set<number>;
  statusText: string;

  // Animation pointers for the current partition
  partitionLow: number | null;
  partitionHigh: number | null;
  pivotIndex: number | null;
  i: number | null; // "wall" pointer
  j: number | null; // scanner pointer
  swapIndices: [number, number] | null; // For highlighting swaps
};

const QuickSort: React.FC = () => {
  const [arraySize, setArraySize] = useState<number>(30);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [isSorted, setIsSorted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  
  const [state, setState] = useState<QuickSortState>({
    array: [],
    stack: [],
    sortedIndices: new Set(),
    statusText: 'Click "Play" or "Next Step" to begin.',
    partitionLow: null,
    partitionHigh: null,
    pivotIndex: null,
    i: null,
    j: null,
    swapIndices: null,
  });

  const resetArray = useCallback(() => {
    setIsSorting(false);
    setIsSorted(false);
    setIsPaused(true);
    const newArray = generateRandomArray(arraySize);
    setState({
      array: newArray,
      stack: newArray.length > 1 ? [[0, newArray.length - 1]] : [],
      sortedIndices: new Set(),
      statusText: 'Ready to sort. The whole array is the first partition.',
      partitionLow: null,
      partitionHigh: null,
      pivotIndex: null,
      i: null,
      j: null,
      swapIndices: null,
    });
  }, [arraySize]);

  useEffect(() => {
    resetArray();
  }, [resetArray]);
  
  const performStep = useCallback(() => {
    setState(prev => {
        // Create a mutable copy of the state for this step's logic
        const nextState: QuickSortState = {
            ...JSON.parse(JSON.stringify(prev)),
            sortedIndices: new Set(prev.sortedIndices),
            stack: [...prev.stack],
        };
        nextState.swapIndices = null; // Clear swap highlight by default

        // If a partition is in progress, continue it
        if (nextState.partitionLow !== null) {
            const { j, pivotIndex, i, partitionLow, partitionHigh } = nextState;

            // Check if the scanner (j) has finished for this partition
            if (j! >= pivotIndex!) {
                const pivotFinalIndex = i! + 1;
                nextState.statusText = `Partition complete. Swapping pivot (${nextState.array[pivotIndex!]}) into final position ${pivotFinalIndex}.`;
                
                // Swap pivot to its final place
                [nextState.array[pivotFinalIndex], nextState.array[pivotIndex!]] = [nextState.array[pivotIndex!], nextState.array[pivotFinalIndex]];
                nextState.swapIndices = [pivotFinalIndex, pivotIndex!]; // Highlight this final swap
                nextState.sortedIndices.add(pivotFinalIndex);

                // Add the new left and right sub-arrays to the stack to be processed later
                if (pivotFinalIndex + 1 < partitionHigh!) nextState.stack.push([pivotFinalIndex + 1, partitionHigh!]);
                if (partitionLow! < pivotFinalIndex - 1) nextState.stack.push([partitionLow!, pivotFinalIndex - 1]);
                
                // Clear current partition state to start a new one on the next step
                nextState.partitionLow = null;
                nextState.partitionHigh = null;
                nextState.pivotIndex = null;
                nextState.i = null;
                nextState.j = null;
            } else {
                // Continue scanning with pointer j
                nextState.statusText = `Comparing j (${nextState.array[j!]}) with pivot (${nextState.array[pivotIndex!]}).`;
                if (nextState.array[j!] < nextState.array[pivotIndex!]) {
                    nextState.i!++;
                    nextState.statusText = `${nextState.array[j!]} < pivot. Increment i, swap a[i] and a[j].`;
                    [nextState.array[nextState.i!], nextState.array[j!]] = [nextState.array[j!], nextState.array[nextState.i!]];
                    nextState.swapIndices = [nextState.i!, j!];
                }
                nextState.j!++; // Move scanner to the next element
            }
        } 
        // No partition in progress, so start a new one from the stack
        else {
            if (nextState.stack.length === 0) {
                nextState.statusText = "Array is sorted!";
                nextState.sortedIndices = new Set(Array.from({ length: nextState.array.length }, (_, k) => k));
                setIsSorted(true);
                setIsSorting(false);
                setIsPaused(true);
            } else {
                const [low, high] = nextState.stack.pop()!;
                if (low >= high) {
                    // This partition has 0 or 1 elements, so it's sorted by default.
                    if (low >= 0 && low < nextState.array.length) nextState.sortedIndices.add(low);
                } else {
                    // Setup pointers for the new partition
                    nextState.partitionLow = low;
                    nextState.partitionHigh = high;
                    nextState.pivotIndex = high;
                    nextState.i = low - 1;
                    nextState.j = low;
                    nextState.statusText = `New partition from index ${low} to ${high}. Pivot is ${nextState.array[high]}.`;
                }
            }
        }
        return nextState;
    });
  }, []);


  useEffect(() => {
    let timerId: number | undefined;
    if (isSorting && !isPaused && !isSorted) {
      timerId = window.setTimeout(performStep, speed);
    }
    return () => clearTimeout(timerId);
  }, [isSorting, isPaused, isSorted, performStep, speed]);

  const handlePlay = () => {
    if (isSorted) {
      resetArray();
       setTimeout(() => {
        setIsSorting(true);
        setIsPaused(false);
      }, 50);
    } else {
      setIsSorting(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => setIsPaused(true);

  const handleNextStep = () => {
    setIsPaused(true);
    if (!isSorting) setIsSorting(true);
    performStep();
  };
  
  const getBarColor = (idx: number) => {
    const { sortedIndices, pivotIndex, i, j, partitionLow, partitionHigh, swapIndices } = state;
    if (isSorted || sortedIndices.has(idx)) return 'bg-green-500';
    if (swapIndices && swapIndices.includes(idx)) return 'bg-red-500'; // Swapping
    if (idx === pivotIndex) return 'bg-purple-500'; // Pivot
    if (idx === j) return 'bg-yellow-400'; // j pointer (scanner)
    if (idx === i) return 'bg-blue-500'; // i pointer (wall)
    if (partitionLow !== null && idx >= partitionLow && partitionHigh !== null && idx <= partitionHigh) return 'bg-cyan-600'; // Current partition
    return 'bg-gray-500'; // Default
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 p-2 bg-gray-700 rounded-md flex-wrap">
        <div className="flex items-center space-x-4">
          <button onClick={resetArray} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors">
            New Array
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap justify-center">
            <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm whitespace-nowrap">Array Size</span>
                <input type="range" min="5" max="50" value={arraySize} onChange={(e) => setArraySize(Number(e.target.value))} disabled={isSorting} className="w-24 md:w-32 cursor-pointer"/>
                <span className="text-gray-300 text-sm w-4">{arraySize}</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">Speed</span>
                <input type="range" min="50" max="1000" step="50" value={1050 - speed} onChange={(e) => setSpeed(1050 - Number(e.target.value))} disabled={isSorting && !isPaused} className="w-24 md:w-32 cursor-pointer"/>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={handlePlay} disabled={isSorting && !isPaused} title={isSorted ? "Play Again" : "Play"} className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiPlay size={20} /></button>
                <button onClick={handlePause} disabled={!isSorting || isPaused || isSorted} title="Pause" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiPause size={20} /></button>
                <button onClick={handleNextStep} disabled={isSorted} title="Next Step" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiSkipForward size={20} /></button>
            </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 text-sm text-gray-300 p-2 bg-gray-900 rounded-md">
        <div className="flex flex-wrap gap-x-4 gap-y-1 items-center justify-center mb-2 sm:mb-0">
          <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-purple-500 mr-2"></div>Pivot</div>
          <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-blue-500 mr-2"></div>Pointer 'i'</div>
          <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-yellow-400 mr-2"></div>Pointer 'j'</div>
          <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-cyan-600 mr-2"></div>Partition</div>
          <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-green-500 mr-2"></div>Sorted</div>
          <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-red-500 mr-2"></div>Swapping</div>
        </div>
        <div className="text-center sm:text-right font-mono text-cyan-400 min-h-[1.25rem] flex-shrink-0 ml-4">{state.statusText}</div>
      </div>
      
      <div className="flex-grow flex items-end justify-center space-x-1 bg-gray-900 p-4 rounded-md min-h-[400px]">
        {state.array.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1 max-w-[2rem] h-full relative" style={{ height: '100%'}}>
              <div className="absolute -top-7 text-center w-full">
                {idx === state.pivotIndex && <span className="text-xs font-bold text-purple-400">Pivot</span>}
                {idx === state.i && <span className="text-xs font-bold text-blue-400">i</span>}
                {idx === state.j && <span className="text-xs font-bold text-yellow-300">j</span>}
              </div>
              <div 
                className={`w-full rounded-t-sm transition-all duration-200 self-end ${getBarColor(idx)}`}
                style={{ height: `${value * 3}px` }}
                title={value.toString()}
              ></div>
              <span className="text-xs mt-1 text-gray-400 hidden sm:inline">{value}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default QuickSort;

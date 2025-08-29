import React, { useState, useEffect, useCallback } from 'react';
import SortControls from './SortControls';
import { useSortingTimer } from '../../hooks/useSortingTimer';

const MIN_VALUE = 10;
const MAX_VALUE = 100;
const DEFAULT_SPEED = 200;

const generateRandomArray = (size: number) => {
  return Array.from({ length: size }, () => 
    Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
  );
};

type MergeOp = { left: number; mid: number; right: number };

const MergeSort: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(30);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [isSorted, setIsSorted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  
  const [stepsQueue, setStepsQueue] = useState<MergeOp[]>([]);
  const [currentMergeOp, setCurrentMergeOp] = useState<MergeOp | null>(null);
  const [auxiliaryArray, setAuxiliaryArray] = useState<number[]>([]);
  const [pointers, setPointers] = useState<{ i: number; j: number; k: number }>({ i: 0, j: 0, k: 0 });

  const resetArray = useCallback(() => {
    setIsSorting(false);
    setIsSorted(false);
    setIsPaused(true);
    setCurrentMergeOp(null);
    setAuxiliaryArray([]);
    
    const newArray = generateRandomArray(arraySize);
    setArray(newArray);

    const steps: MergeOp[] = [];
    for (let width = 1; width < arraySize; width *= 2) {
      for (let i = 0; i < arraySize; i += 2 * width) {
        const left = i;
        const mid = Math.min(i + width - 1, arraySize - 1);
        const right = Math.min(i + 2 * width - 1, arraySize - 1);
        if (mid < right) {
          steps.push({ left, mid, right });
        }
      }
    }
    setStepsQueue(steps);
  }, [arraySize]);

  useEffect(() => {
    resetArray();
  }, [resetArray]);

  const performStep = useCallback(() => {
    if (isSorted) return;

    // Phase 1: Setup a new merge operation if there isn't one
    if (!currentMergeOp) {
      const nextOp = stepsQueue.shift();
      if (!nextOp) {
        setIsSorted(true);
        setIsSorting(false);
        setIsPaused(true);
        return;
      }
      
      setCurrentMergeOp(nextOp);
      setAuxiliaryArray(array.slice(nextOp.left, nextOp.right + 1));
      setPointers({
        i: 0,
        j: nextOp.mid - nextOp.left + 1,
        k: nextOp.left,
      });
      return; // Dedicate this step just for setup
    }
    
    // Phase 2: Perform one step of the merge
    const { left, mid, right } = currentMergeOp;
    let { i, j, k } = pointers;

    const leftHalfEnd = mid - left;
    const rightHalfEnd = right - left;

    let newArray = [...array];

    if (i <= leftHalfEnd && j <= rightHalfEnd) {
      if (auxiliaryArray[i] <= auxiliaryArray[j]) {
        newArray[k] = auxiliaryArray[i];
        i++;
      } else {
        newArray[k] = auxiliaryArray[j];
        j++;
      }
    } else if (i <= leftHalfEnd) {
      newArray[k] = auxiliaryArray[i];
      i++;
    } else if (j <= rightHalfEnd) {
      newArray[k] = auxiliaryArray[j];
      j++;
    }
    k++;

    setArray(newArray);
    setPointers({ i, j, k });

    // If merge for this op is complete, reset for the next op
    if (k > right) {
      setCurrentMergeOp(null);
      setAuxiliaryArray([]);
    }
  }, [array, currentMergeOp, pointers, stepsQueue, isSorted, auxiliaryArray]);

  useSortingTimer({ isSorting, isPaused, isFinished: isSorted, speed, performStep });
  
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

  const getMainBarColor = (idx: number) => {
    if (isSorted) return 'bg-green-500';
    if (currentMergeOp) {
      const { left, right } = currentMergeOp;
      if (idx >= left && idx <= right) {
        // Highlight the element just placed
        if (idx === pointers.k - 1) return 'bg-yellow-400';
        // Dim the rest of the working area
        return 'bg-gray-700 opacity-50';
      }
    }
    return 'bg-gray-500';
  }
  
  const midPointInAux = currentMergeOp ? currentMergeOp.mid - currentMergeOp.left : -1;

  return (
    <div className="flex flex-col h-full">
      <SortControls
        isSorting={isSorting}
        isPaused={isPaused}
        isFinished={isSorted}
        arraySize={arraySize}
        speed={speed}
        onReset={resetArray}
        onPlay={handlePlay}
        onPause={handlePause}
        onNextStep={handleNextStep}
        onSizeChange={setArraySize}
        onSpeedChange={setSpeed}
        maxSize={50}
      />
      
      <div className="flex-grow flex flex-col items-center justify-around bg-gray-900 p-4 rounded-md min-h-[450px]">
        {/* Main Array */}
        <div className="flex items-end justify-center space-x-1 w-full">
            {array.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1 max-w-[2rem] relative">
                {currentMergeOp && idx === pointers.k && <span className="absolute -top-6 text-yellow-400 font-bold animate-bounce">k</span>}
                <div 
                className={`w-full rounded-t-sm transition-all duration-200 ${getMainBarColor(idx)}`}
                style={{ height: `${value * 2.5}px` }}
                title={value.toString()}
                ></div>
                <span className="text-xs mt-1 text-gray-400 hidden sm:inline">{value}</span>
            </div>
            ))}
        </div>

        {/* Auxiliary Array Visualization */}
        <div className="mt-4 w-full">
            <p className="text-center text-gray-400 mb-2 text-sm">Auxiliary Array (Merging Area)</p>
            <div className="flex items-end justify-center space-x-1 p-2 bg-gray-800/50 rounded-md min-h-40">
                {currentMergeOp && auxiliaryArray.map((value, auxIdx) => {
                    let bgColor = auxIdx <= midPointInAux ? 'bg-blue-500' : 'bg-orange-500';
                    if (auxIdx === pointers.i || auxIdx === pointers.j) {
                        bgColor = 'bg-yellow-400';
                    }
                    return (
                        <div key={auxIdx} className="flex flex-col items-center flex-1 max-w-[2rem] relative">
                            {auxIdx === pointers.i && <span className="absolute -top-5 font-bold text-blue-300">i</span>}
                            {auxIdx === pointers.j && <span className="absolute -top-5 font-bold text-orange-300">j</span>}
                            <div 
                                className={`w-full rounded-t-sm transition-colors duration-200 ${bgColor}`}
                                style={{ height: `${value * 1.5}px` }}
                            >
                                <span className="text-xs text-black font-semibold relative top-1 left-1">{value}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MergeSort;
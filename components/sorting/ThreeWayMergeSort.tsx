import React, { useState, useEffect, useCallback } from 'react';
import SortControls from './SortControls';
import { useSortingTimer } from '../../hooks/useSortingTimer';

const MIN_VALUE = 10;
const MAX_VALUE = 100;
const DEFAULT_SPEED = 300;

const generateRandomArray = (size: number) => {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
  );
};

type MergeOp = { left: number; mid1: number; mid2: number; right: number };

const ThreeWayMergeSort: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(30);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [isSorted, setIsSorted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  
  const [stepsQueue, setStepsQueue] = useState<MergeOp[]>([]);
  const [currentMergeOp, setCurrentMergeOp] = useState<MergeOp | null>(null);
  const [auxiliaryArray, setAuxiliaryArray] = useState<number[]>([]);
  const [pointers, setPointers] = useState<{ i: number; j: number; k: number; l: number }>({ i: 0, j: 0, k: 0, l: 0 });

  const resetArray = useCallback(() => {
    setIsSorting(false);
    setIsSorted(false);
    setIsPaused(true);
    setCurrentMergeOp(null);
    setAuxiliaryArray([]);
    
    const newArray = generateRandomArray(arraySize);
    setArray(newArray);

    const steps: MergeOp[] = [];
    for (let width = 1; width < arraySize; width *= 3) {
      for (let i = 0; i < arraySize; i += 3 * width) {
        const left = i;
        const mid1 = Math.min(i + width - 1, arraySize - 1);
        const mid2 = Math.min(i + 2 * width - 1, arraySize - 1);
        const right = Math.min(i + 3 * width - 1, arraySize - 1);
        
        if (mid1 < right) { 
          steps.push({ left, mid1, mid2, right });
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
        j: nextOp.mid1 - nextOp.left + 1,
        k: nextOp.mid2 - nextOp.left + 1,
        l: nextOp.left,
      });
      return;
    }
    
    const { left, mid1, mid2, right } = currentMergeOp;
    let { i, j, k, l } = pointers;

    const part1End = mid1 - left;
    const part2End = mid2 - left;
    const part3End = right - left;

    let newArray = [...array];
    
    const i_valid = i <= part1End;
    const j_valid = j <= part2End;
    const k_valid = k <= part3End;
    
    if (i_valid && j_valid && k_valid) {
        if (auxiliaryArray[i] <= auxiliaryArray[j] && auxiliaryArray[i] <= auxiliaryArray[k]) {
            newArray[l] = auxiliaryArray[i++];
        } else if (auxiliaryArray[j] <= auxiliaryArray[i] && auxiliaryArray[j] <= auxiliaryArray[k]) {
            newArray[l] = auxiliaryArray[j++];
        } else {
            newArray[l] = auxiliaryArray[k++];
        }
    } else if (i_valid && j_valid) {
        if (auxiliaryArray[i] <= auxiliaryArray[j]) {
            newArray[l] = auxiliaryArray[i++];
        } else {
            newArray[l] = auxiliaryArray[j++];
        }
    } else if (i_valid && k_valid) {
        if (auxiliaryArray[i] <= auxiliaryArray[k]) {
            newArray[l] = auxiliaryArray[i++];
        } else {
            newArray[l] = auxiliaryArray[k++];
        }
    } else if (j_valid && k_valid) {
        if (auxiliaryArray[j] <= auxiliaryArray[k]) {
            newArray[l] = auxiliaryArray[j++];
        } else {
            newArray[l] = auxiliaryArray[k++];
        }
    } else if (i_valid) {
        newArray[l] = auxiliaryArray[i++];
    } else if (j_valid) {
        newArray[l] = auxiliaryArray[j++];
    } else if (k_valid) {
        newArray[l] = auxiliaryArray[k++];
    }
    
    l++;

    setArray(newArray);
    setPointers({ i, j, k, l });

    if (l > right) {
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
        if (idx === pointers.l - 1) return 'bg-yellow-400';
        return 'bg-gray-700 opacity-50';
      }
    }
    return 'bg-gray-500';
  }
  
  const part1End = currentMergeOp ? currentMergeOp.mid1 - currentMergeOp.left : -1;
  const part2End = currentMergeOp ? currentMergeOp.mid2 - currentMergeOp.left : -1;

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
                {currentMergeOp && idx === pointers.l && <span className="absolute -top-6 text-yellow-400 font-bold animate-bounce">↓</span>}
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
                    let bgColor = 'bg-purple-500';
                    if (auxIdx <= part1End) bgColor = 'bg-blue-500';
                    else if (auxIdx <= part2End) bgColor = 'bg-orange-500';

                    if (auxIdx === pointers.i || auxIdx === pointers.j || auxIdx === pointers.k) {
                        bgColor = 'bg-yellow-400';
                    }

                    return (
                        <div key={auxIdx} className="flex flex-col items-center flex-1 max-w-[2rem] relative">
                            {auxIdx === pointers.i && <span className="absolute -top-5 font-bold text-blue-300">i</span>}
                            {auxIdx === pointers.j && <span className="absolute -top-5 font-bold text-orange-300">j</span>}
                            {auxIdx === pointers.k && <span className="absolute -top-5 font-bold text-purple-300">k</span>}
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

export default ThreeWayMergeSort;
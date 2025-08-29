import React, { useState, useEffect, useCallback } from 'react';
import SortControls from './SortControls';
import { useSortingTimer } from '../../hooks/useSortingTimer';

const MIN_VALUE = 1;
const MAX_VALUE = 15; // Lower max value for manageable count array
const DEFAULT_SPEED = 250;

const generateRandomArray = (size: number) => {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
  );
};

type SortPhase = 'IDLE' | 'COUNTING' | 'MODIFYING_COUNT' | 'BUILDING_OUTPUT' | 'COPYING' | 'DONE';

const CountSort: React.FC = () => {
    const [array, setArray] = useState<number[]>([]);
    const [arraySize, setArraySize] = useState<number>(15);
    const [isSorting, setIsSorting] = useState<boolean>(false);
    const [isSorted, setIsSorted] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);

    const [countArray, setCountArray] = useState<number[]>([]);
    const [outputArray, setOutputArray] = useState<(number | null)[]>([]);
    const [phase, setPhase] = useState<SortPhase>('IDLE');
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [statusText, setStatusText] = useState('Ready to sort.');

    const resetArray = useCallback(() => {
        setIsSorting(false);
        setIsSorted(false);
        setIsPaused(true);
        const newArray = generateRandomArray(arraySize);
        setArray(newArray);
        setCountArray(Array(MAX_VALUE + 1).fill(0));
        setOutputArray(Array(arraySize).fill(null));
        setPhase('IDLE');
        setCurrentIndex(null);
        setStatusText('Ready to sort.');
    }, [arraySize]);

    useEffect(() => {
        resetArray();
    }, [resetArray]);

    const performStep = useCallback(() => {
        if (phase === 'IDLE') {
            setPhase('COUNTING');
            setCurrentIndex(0);
            setStatusText('Phase 1: Counting occurrences of each number.');
            return;
        }

        if (phase === 'COUNTING') {
            if (currentIndex! >= array.length) {
                setPhase('MODIFYING_COUNT');
                setCurrentIndex(1); // Start modifying from index 1
                setStatusText('Phase 2: Creating cumulative counts for position mapping.');
                return;
            }
            const value = array[currentIndex!];
            setCountArray(prev => {
                const newCounts = [...prev];
                newCounts[value]++;
                return newCounts;
            });
            setCurrentIndex(currentIndex! + 1);
        }

        if (phase === 'MODIFYING_COUNT') {
            if (currentIndex! >= countArray.length) {
                setPhase('BUILDING_OUTPUT');
                setCurrentIndex(array.length - 1);
                setStatusText('Phase 3: Building the sorted output array.');
                return;
            }
            setCountArray(prev => {
                const newCounts = [...prev];
                newCounts[currentIndex!] += newCounts[currentIndex! - 1];
                return newCounts;
            });
            setCurrentIndex(currentIndex! + 1);
        }

        if (phase === 'BUILDING_OUTPUT') {
             if (currentIndex! < 0) {
                setPhase('COPYING');
                setCurrentIndex(0);
                setStatusText('Phase 4: Copying sorted array back.');
                return;
            }

            const value = array[currentIndex!];
            setCountArray(prev => {
                const newCounts = [...prev];
                const position = newCounts[value] - 1;
                setOutputArray(out => {
                    const newOut = [...out];
                    newOut[position] = value;
                    return newOut;
                });
                newCounts[value]--;
                return newCounts;
            });
            setCurrentIndex(currentIndex! - 1);
        }

        if (phase === 'COPYING') {
            if (currentIndex! >= array.length) {
                setPhase('DONE');
                setStatusText('Array is sorted!');
                setIsSorted(true);
                setIsSorting(false);
                setIsPaused(true);
                setCurrentIndex(null);
                return;
            }
            setArray(prev => {
                const newArr = [...prev];
                newArr[currentIndex!] = outputArray[currentIndex!]!;
                return newArr;
            });
            setCurrentIndex(currentIndex! + 1);
        }
    }, [phase, currentIndex, array, countArray, outputArray]);

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

    const getCellClass = (val: number | null, isHighlighted: boolean) => {
        if (val === null) return 'bg-gray-800';
        if (isHighlighted) return 'bg-yellow-400 text-black scale-110';
        if (isSorted || phase === 'DONE') return 'bg-green-500 text-black';
        return 'bg-gray-600 text-white';
    };

    return (
        <div className="flex flex-col h-full">
            <SortControls
                isSorting={isSorting} isPaused={isPaused} isFinished={isSorted}
                arraySize={arraySize} speed={speed}
                onReset={resetArray} onPlay={handlePlay} onPause={handlePause}
                onNextStep={handleNextStep} onSizeChange={setArraySize} onSpeedChange={setSpeed}
                maxSize={25} minSpeed={100} maxSpeed={1000} speedStep={50}
            />

            <div className="flex-grow flex flex-col justify-around gap-4 bg-gray-900 p-4 rounded-md">
                <div className="text-center font-mono text-cyan-400 min-h-[1.25rem]">{statusText}</div>
                {/* Original Array */}
                <div>
                    <h3 className="text-lg text-gray-400 mb-2 text-center">Original Array</h3>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {array.map((value, idx) => (
                            <div key={idx} className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-md transition-all duration-200 ${getCellClass(value, (phase === 'COUNTING' || phase === 'BUILDING_OUTPUT') && currentIndex === idx)}`}>
                                {value}
                            </div>
                        ))}
                    </div>
                </div>
                {/* Count Array */}
                <div>
                    <h3 className="text-lg text-gray-400 mb-2 text-center">Count Array (Index: Value, Content: Count/Position)</h3>
                    <div className="flex flex-wrap items-center justify-center gap-1">
                        {countArray.map((value, idx) => (
                             <div key={idx} className="flex flex-col items-center w-8">
                                <div className={`w-full h-8 flex items-center justify-center text-xs font-bold rounded-md transition-all duration-200 ${getCellClass(value, (phase === 'COUNTING' && array[currentIndex!] === idx) || (phase === 'MODIFYING_COUNT' && currentIndex === idx))}`}>
                                    {value}
                                </div>
                                <span className="text-xs text-gray-500 mt-1">{idx}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Output Array */}
                <div>
                    <h3 className="text-lg text-gray-400 mb-2 text-center">Output Array</h3>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {outputArray.map((value, idx) => (
                            <div key={idx} className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-md transition-all duration-200 ${getCellClass(value, false)}`}>
                                {value === null ? '' : value}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountSort;

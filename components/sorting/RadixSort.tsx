import React, { useState, useEffect, useCallback } from 'react';
import SortControls from './SortControls';
import { useSortingTimer } from '../../hooks/useSortingTimer';

const MIN_VALUE = 1;
const MAX_VALUE = 999;
const DEFAULT_SPEED = 300;

const generateRandomArray = (size: number) => {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
  );
};

type RadixPhase = 'IDLE' | 'DISTRIBUTING' | 'COLLECTING' | 'DONE';

const RadixSort: React.FC = () => {
    const [array, setArray] = useState<number[]>([]);
    const [arraySize, setArraySize] = useState<number>(12);
    const [isSorting, setIsSorting] = useState<boolean>(false);
    const [isSorted, setIsSorted] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(true);
    const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);

    const [phase, setPhase] = useState<RadixPhase>('IDLE');
    const [digitPlace, setDigitPlace] = useState<number>(1);
    const [maxNumber, setMaxNumber] = useState(0);
    const [buckets, setBuckets] = useState<number[][]>(() => Array.from({ length: 10 }, () => []));
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [statusText, setStatusText] = useState('Ready to sort.');
    const [distributingFrom, setDistributingFrom] = useState<number[][]>([]);


    const resetArray = useCallback(() => {
        setIsSorting(false);
        setIsSorted(false);
        setIsPaused(true);
        const newArray = generateRandomArray(arraySize);
        setArray(newArray);
        setDistributingFrom([newArray]);
        setMaxNumber(Math.max(...newArray, 0));
        setBuckets(Array.from({ length: 10 }, () => []));
        setPhase('IDLE');
        setDigitPlace(1);
        setCurrentIndex(0);
        setStatusText('Ready to sort.');
    }, [arraySize]);

    useEffect(() => { resetArray(); }, [resetArray]);

    const performStep = useCallback(() => {
        if (phase === 'IDLE') {
            setPhase('DISTRIBUTING');
            setCurrentIndex(0);
            setStatusText(`Sorting by ${digitPlace}s place.`);
            return;
        }

        if (phase === 'DISTRIBUTING') {
            if (currentIndex! >= array.length) {
                setPhase('COLLECTING');
                setCurrentIndex(0); // This will now be the destination index in the main array
                setStatusText('Collecting numbers from buckets.');
                return;
            }
            const num = array[currentIndex!];
            const bucketIndex = Math.floor(num / digitPlace) % 10;
            setBuckets(prev => {
                const newBuckets = prev.map(b => [...b]);
                newBuckets[bucketIndex].push(num);
                return newBuckets;
            });
            setCurrentIndex(prev => prev! + 1);
        }

        if (phase === 'COLLECTING') {
            let tempArray: number[] = [];
            for (const bucket of buckets) {
                tempArray = tempArray.concat(bucket);
            }
            setArray(tempArray);

            const nextDigitPlace = digitPlace * 10;
            if (nextDigitPlace > maxNumber) {
                setPhase('DONE');
                setStatusText('Array is sorted!');
                setIsSorted(true);
                setIsSorting(false);
                setIsPaused(true);
            } else {
                setDigitPlace(nextDigitPlace);
                setPhase('DISTRIBUTING');
                setCurrentIndex(0);
                setStatusText(`Sorting by ${nextDigitPlace}s place.`);
            }
            setBuckets(Array.from({ length: 10 }, () => []));
        }
    }, [phase, currentIndex, array, buckets, digitPlace, maxNumber]);

    useSortingTimer({ isSorting, isPaused, isFinished: isSorted, speed, performStep });
    
    const handlePlay = () => {
        if (isSorted) {
            resetArray();
            setTimeout(() => { setIsSorting(true); setIsPaused(false); }, 50);
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

    const getHighlightStyle = (num: number) => {
        if (phase !== 'DISTRIBUTING' || digitPlace > num) return { color: 'inherit' };
        
        const numStr = String(num);
        let placeValue = 1;
        let digitIndex = -1;
        for (let i = numStr.length - 1; i >= 0; i--) {
            if (placeValue === digitPlace) {
                digitIndex = i;
                break;
            }
            placeValue *= 10;
        }

        if (digitIndex === -1) return { color: 'inherit' };

        return {
            background: `linear-gradient(to right, white ${digitIndex}ch, #facc15 ${digitIndex}ch, #facc15 ${digitIndex + 1}ch, white ${digitIndex + 1}ch)`,
            color: 'black',
            display: 'inline-block',
            padding: '2px 0',
            borderRadius: '3px',
            lineHeight: '1.2'
        };
    };

    return (
        <div className="flex flex-col h-full">
            <SortControls
                isSorting={isSorting} isPaused={isPaused} isFinished={isSorted}
                arraySize={arraySize} speed={speed}
                onReset={resetArray} onPlay={handlePlay} onPause={handlePause}
                onNextStep={handleNextStep} onSizeChange={setArraySize} onSpeedChange={setSpeed}
                maxSize={20} minSpeed={100} maxSpeed={1000} speedStep={50}
            />

            <div className="flex-grow flex flex-col justify-around gap-2 bg-gray-900 p-4 rounded-md">
                <div className="text-center font-mono text-cyan-400 min-h-[1.25rem]">{statusText}</div>
                
                <div className="flex flex-wrap items-center justify-center gap-2 border-b-2 border-gray-700 pb-4">
                    {array.map((value, idx) => (
                        <div key={idx} className={`w-14 h-10 flex items-center justify-center text-sm font-bold rounded-md transition-all duration-200 text-white ${isSorted ? 'bg-green-500' : 'bg-gray-600'} ${currentIndex === idx && phase === 'DISTRIBUTING' ? 'ring-2 ring-yellow-400' : ''}`}>
                             <span style={getHighlightStyle(value)}>{value}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-5 md:grid-cols-10 gap-2 flex-grow">
                    {buckets.map((bucket, bIndex) => (
                        <div key={bIndex} className="bg-gray-800 rounded-md p-1 flex flex-col items-center">
                            <div className="w-full text-center text-sm font-bold text-cyan-400 border-b border-gray-600 mb-1">{bIndex}</div>
                            <div className="flex flex-col gap-1 w-full">
                                {bucket.map((value, vIndex) => (
                                    <div key={vIndex} className="w-full h-8 flex items-center justify-center text-xs font-bold rounded bg-gray-600 text-white">
                                        {value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RadixSort;

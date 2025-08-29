import { useEffect } from 'react';

interface UseSortingTimerProps {
  isSorting: boolean;
  isPaused: boolean;
  isFinished: boolean;
  speed: number;
  performStep: () => void;
}

export const useSortingTimer = ({
  isSorting,
  isPaused,
  isFinished,
  speed,
  performStep,
}: UseSortingTimerProps) => {
  useEffect(() => {
    let timerId: number | undefined;
    if (isSorting && !isPaused && !isFinished) {
      timerId = window.setTimeout(performStep, speed);
    }
    return () => clearTimeout(timerId);
  }, [isSorting, isPaused, isFinished, performStep, speed]);
};

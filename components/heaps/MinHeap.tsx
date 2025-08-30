import React from 'react';
import useHeap from './useHeap';
import HeapVisualizer from './HeapVisualizer';

const MinHeap: React.FC = () => {
  const heapProps = useHeap('min');
  
  return (
    <HeapVisualizer 
        {...heapProps} 
        heapTypeName="Min" 
    />
  );
};

export default MinHeap;
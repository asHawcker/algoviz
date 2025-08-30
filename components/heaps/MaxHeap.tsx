import React from 'react';
import useHeap from './useHeap';
import HeapVisualizer from './HeapVisualizer';

const MaxHeap: React.FC = () => {
  const heapProps = useHeap('max');
  
  return (
    <HeapVisualizer 
        {...heapProps} 
        heapTypeName="Max" 
    />
  );
};

export default MaxHeap;
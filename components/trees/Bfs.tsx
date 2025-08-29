import React from 'react';
import useTreeTraversal from './useTreeTraversal';
import TreeVisualizer from './TreeVisualizer';

const Bfs: React.FC = () => {
  const traversalProps = useTreeTraversal('bfs');

  return (
    <TreeVisualizer
      {...traversalProps}
      dataStructureName="Queue"
    />
  );
};

export default Bfs;

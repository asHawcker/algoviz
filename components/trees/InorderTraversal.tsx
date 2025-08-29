import React from 'react';
import useTreeTraversal from './useTreeTraversal';
import TreeVisualizer from './TreeVisualizer';

const InorderTraversal: React.FC = () => {
  const traversalProps = useTreeTraversal('inorder');

  return (
    <TreeVisualizer
      {...traversalProps}
      dataStructureName="Stack"
    />
  );
};

export default InorderTraversal;

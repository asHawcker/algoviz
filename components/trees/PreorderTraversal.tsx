import React from 'react';
import useTreeTraversal from './useTreeTraversal';
import TreeVisualizer from './TreeVisualizer';

const PreorderTraversal: React.FC = () => {
  const traversalProps = useTreeTraversal('preorder');

  return (
    <TreeVisualizer
      {...traversalProps}
      dataStructureName="Stack"
    />
  );
};

export default PreorderTraversal;

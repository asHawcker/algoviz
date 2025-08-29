import React from 'react';
import useTreeTraversal from './useTreeTraversal';
import TreeVisualizer from './TreeVisualizer';

const PostorderTraversal: React.FC = () => {
  const traversalProps = useTreeTraversal('postorder');

  return (
    <TreeVisualizer
      {...traversalProps}
      dataStructureName="Stack"
    />
  );
};

export default PostorderTraversal;

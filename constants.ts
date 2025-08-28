import type { AlgorithmData } from './types';

export const ALGORITHM_KEYS = {
    BUBBLE_SORT: 'BUBBLE_SORT',
    QUICK_SORT: 'QUICK_SORT',
    MERGE_SORT: 'MERGE_SORT',
    LINEAR_SEARCH: 'LINEAR_SEARCH',
    BINARY_SEARCH: 'BINARY_SEARCH',
    INORDER_TRAVERSAL: 'INORDER_TRAVERSAL',
    PREORDER_TRAVERSAL: 'PREORDER_TRAVERSAL',
    POSTORDER_TRAVERSAL: 'POSTORDER_TRAVERSAL',
    BFS: 'BFS',
    DFS: 'DFS',
};

export const ALGORITHMS: AlgorithmData = {
  SORTING: {
    name: 'Sorting Algorithms',
    algorithms: {
      [ALGORITHM_KEYS.BUBBLE_SORT]: { name: 'Bubble Sort', key: ALGORITHM_KEYS.BUBBLE_SORT },
      [ALGORITHM_KEYS.QUICK_SORT]: { name: 'Quick Sort', key: ALGORITHM_KEYS.QUICK_SORT },
      [ALGORITHM_KEYS.MERGE_SORT]: { name: 'Merge Sort', key: ALGORITHM_KEYS.MERGE_SORT },
    }
  },
  SEARCHING: {
    name: 'Searching Algorithms',
    algorithms: {
      [ALGORITHM_KEYS.LINEAR_SEARCH]: { name: 'Linear Search', key: ALGORITHM_KEYS.LINEAR_SEARCH },
      [ALGORITHM_KEYS.BINARY_SEARCH]: { name: 'Binary Search', key: ALGORITHM_KEYS.BINARY_SEARCH },
    }
  },
  TREES: {
    name: 'Trees',
    algorithms: {
        [ALGORITHM_KEYS.INORDER_TRAVERSAL]: { name: 'Inorder Traversal', key: ALGORITHM_KEYS.INORDER_TRAVERSAL },
        [ALGORITHM_KEYS.PREORDER_TRAVERSAL]: { name: 'Preorder Traversal', key: ALGORITHM_KEYS.PREORDER_TRAVERSAL },
        [ALGORITHM_KEYS.POSTORDER_TRAVERSAL]: { name: 'Postorder Traversal', key: ALGORITHM_KEYS.POSTORDER_TRAVERSAL },
        [ALGORITHM_KEYS.BFS]: { name: 'BFS', key: ALGORITHM_KEYS.BFS },
        [ALGORITHM_KEYS.DFS]: { name: 'DFS', key: ALGORITHM_KEYS.DFS },
    }
  }
};
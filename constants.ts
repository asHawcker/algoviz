import type { AlgorithmData } from './types';

export const ALGORITHM_KEYS = {
    BUBBLE_SORT: 'BUBBLE_SORT',
    INSERTION_SORT: 'INSERTION_SORT',
    SELECTION_SORT: 'SELECTION_SORT',
    QUICK_SORT: 'QUICK_SORT',
    MERGE_SORT: 'MERGE_SORT',
    THREE_WAY_MERGE_SORT: 'THREE_WAY_MERGE_SORT',
    HEAP_SORT: 'HEAP_SORT',
    COUNT_SORT: 'COUNT_SORT',
    RADIX_SORT: 'RADIX_SORT',
    LINEAR_SEARCH: 'LINEAR_SEARCH',
    BINARY_SEARCH: 'BINARY_SEARCH',
    INORDER_TRAVERSAL: 'INORDER_TRAVERSAL',
    PREORDER_TRAVERSAL: 'PREORDER_TRAVERSAL',
    POSTORDER_TRAVERSAL: 'POSTORDER_TRAVERSAL',
    BFS: 'BFS',
    DFS: 'DFS',
    MIN_HEAP: 'MIN_HEAP',
    MAX_HEAP: 'MAX_HEAP',
    DIJKSTRA: 'DIJKSTRA',
    BELLMAN_FORD: 'BELLMAN_FORD',
    KRUSKAL: 'KRUSKAL',
    TOPOLOGICAL_SORT: 'TOPOLOGICAL_SORT',
};

export const ALGORITHMS: AlgorithmData = {
  SORTING: {
    name: 'Sorting Algorithms',
    algorithms: {
      [ALGORITHM_KEYS.BUBBLE_SORT]: { name: 'Bubble Sort', key: ALGORITHM_KEYS.BUBBLE_SORT },
      [ALGORITHM_KEYS.INSERTION_SORT]: { name: 'Insertion Sort', key: ALGORITHM_KEYS.INSERTION_SORT },
      [ALGORITHM_KEYS.SELECTION_SORT]: { name: 'Selection Sort', key: ALGORITHM_KEYS.SELECTION_SORT },
      [ALGORITHM_KEYS.QUICK_SORT]: { name: 'Quick Sort', key: ALGORITHM_KEYS.QUICK_SORT },
      [ALGORITHM_KEYS.MERGE_SORT]: { name: 'Merge Sort', key: ALGORITHM_KEYS.MERGE_SORT },
      [ALGORITHM_KEYS.THREE_WAY_MERGE_SORT]: { name: '3-Way Merge Sort', key: ALGORITHM_KEYS.THREE_WAY_MERGE_SORT },
      [ALGORITHM_KEYS.HEAP_SORT]: { name: 'Heap Sort', key: ALGORITHM_KEYS.HEAP_SORT },
      [ALGORITHM_KEYS.COUNT_SORT]: { name: 'Count Sort', key: ALGORITHM_KEYS.COUNT_SORT },
      [ALGORITHM_KEYS.RADIX_SORT]: { name: 'Radix Sort', key: ALGORITHM_KEYS.RADIX_SORT },
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
  },
  HEAPS: {
    name: 'Heaps',
    algorithms: {
        [ALGORITHM_KEYS.MIN_HEAP]: { name: 'Min Heap', key: ALGORITHM_KEYS.MIN_HEAP },
        [ALGORITHM_KEYS.MAX_HEAP]: { name: 'Max Heap', key: ALGORITHM_KEYS.MAX_HEAP },
    }
  },
  GRAPHS: {
      name: 'Graphs',
      algorithms: {
          [ALGORITHM_KEYS.DIJKSTRA]: { name: "Dijkstra's Algorithm", key: ALGORITHM_KEYS.DIJKSTRA },
          [ALGORITHM_KEYS.BELLMAN_FORD]: { name: "Bellman-Ford Algorithm", key: ALGORITHM_KEYS.BELLMAN_FORD },
          [ALGORITHM_KEYS.KRUSKAL]: { name: "Kruskal's Algorithm", key: ALGORITHM_KEYS.KRUSKAL },
          [ALGORITHM_KEYS.TOPOLOGICAL_SORT]: { name: 'Topological Sort', key: ALGORITHM_KEYS.TOPOLOGICAL_SORT },
      }
  }
};

export interface Algorithm {
    name: string;
    key: string;
}

export interface AlgorithmCategory {
    name: string;
    algorithms: Record<string, Algorithm>;
}

export interface AlgorithmData {
    SORTING: AlgorithmCategory;
    SEARCHING: AlgorithmCategory;
}

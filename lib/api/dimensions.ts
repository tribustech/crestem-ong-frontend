export interface DimensionOption {
  value: number;
  label: string;
}

export interface DimensionQuestion {
  id: string;
  question: string;
  options: DimensionOption[];
  tag: string | null;
}

export interface Dimension {
  key: string;
  name: string;
  quiz: DimensionQuestion[];
}

export const LANGUAGE_MAPPING: {
  [key: string]: {
    judge0: number;
    internal: number;
    name: string;
    monaco: string;
  };
} = {
  js: { judge0: 63, internal: 1, name: "Javascript", monaco: "javascript" },
  cpp: { judge0: 54, internal: 2, name: "C++", monaco: "cpp" },
  python: { judge0: 71, internal: 3, name: "Python", monaco: "python" },
  java: { judge0: 62, internal: 4, name: "Java", monaco: "java" },
};

export const DIFFICULTY_MAPPING: {
  [key: number]: string;
} = {
  0: "EASY",
  1: "EASY",
  2: "MEDIUM",
  3: "MEDIUM",
  4: "HARD",
}


export const SCORE_MAPPING: {
  [key: number]: number;
} = {
  0: 20,
  1: 20,
  2: 50,
  3: 50,
  4: 100,
}
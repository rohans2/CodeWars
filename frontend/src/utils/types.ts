export type Problem = {
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  defaultCode: string;
  examples: string;
  testCases: string;
};

export type Example = {
  input: string;
  output: string;
};
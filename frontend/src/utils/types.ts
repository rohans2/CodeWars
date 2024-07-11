export type Problem = {
  id: string;
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

export type User = {
  email: string;
  name?:string;
  role: "USER" | "ADMIN";
}
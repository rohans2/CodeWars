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
  name?: string;
  role: "USER" | "ADMIN";
}
export interface Score {
  score: number;
  userId: string;
}

export type updateType = {
  type: "update";
  scores: Score[];
}

export type errorType = {
  type: "error";
  message: string;
}

export interface Room {
  id: string;
  name?: string
  users: User[];
  password?: string;
}


import { Editor } from "@monaco-editor/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const CodeSubmission = () => {
  const problem = {
    slug: "sample-problem",
    title: "Sample Problem Sample",
    description: `## Classroom

      Sample

      For example


    Input

\`\`\`
[1, 2, 3, 4, 5]
\`\`\`

Output
\`\`\`
9
\`\`\`

\`\`\`
[2, 3, 4, 5, 1, 100]
\`\`\`

Output
\`\`\`
105
\`\`\``,
    difficulty: "EASY",
  };
  return (
    <div className="grid grid-cols-2 gap-x-5 max-h-screen]">
      <div className="ml-5 mt-6 p-6 min-w-1/2 h-[calc(100vh-65px)]">
        <Markdown remarkPlugins={[remarkGfm]}>{problem.description}</Markdown>
      </div>
      <div>
        <Editor
          defaultLanguage="Java"
          defaultValue="// Your code here"
          theme="vs-dark"
          className="max-w-1/2 h-[calc(100vh-65px)]"
        />
      </div>
    </div>
  );
};
//antlr
//react-markdown

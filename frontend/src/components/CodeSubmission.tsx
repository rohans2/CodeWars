import { Editor } from "@monaco-editor/react";

export const CodeSubmission = () => {
  return (
    <div>
      <Editor
        height="90vh"
        defaultLanguage="Java"
        defaultValue="// some comment"
        theme="vs-dark"
      />
    </div>
  );
};

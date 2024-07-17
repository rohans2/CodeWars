import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
// import Markdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
// import remarkGfm from "remark-gfm";
import { Problem } from "../utils/types";
import axios from "axios";
import { ProblemComponent } from "./Problem";
import { LanguageSelector } from "./LanguageSelector";
import { useRecoilValue } from "recoil";
import { userAtom } from "../atoms/user";
import { ProblemSubmitBar } from "./ProblemSubmitBar";
import { LANGUAGE_MAPPING } from "../utils/constants";

export const CodeSubmission = () => {
  const params = useParams();
  const slug = params.slug;
  console.log("slug", slug);
  const [code, setCode] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState("cpp");
  const [problem, setProblem] = useState<Problem | null>(null);
  const user = useRecoilValue(userAtom);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    axios
      .get(
        `http://localhost:8080/api/v1/${user.role.toLowerCase()}/problem/${slug}`,
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        if (res.status !== 200) {
          setProblem(null);
          return;
        }
        console.log(res.data);
        setProblem(res.data.problem);
      });
  }, [slug, navigate, user]);

  if (!problem) {
    return <div>Loading...</div>;
  }
  return (
    <div className="grid grid-cols-2 gap-x-5 h-[90vh]">
      <div className="ml-5 mt-6  p-6 min-w-1/2 overflow-auto">
        <ProblemComponent problem={problem} />
      </div>
      <div className="flex flex-col gap-y-2 p-5 h-[85vh]">
        <LanguageSelector language={language} setLanguage={setLanguage} />
        <Editor
          defaultLanguage="cpp"
          defaultValue="// Your code here"
          theme="vs-dark"
          height={"90%"}
          value={code[language]}
          options={{
            fontSize: 14,
          }}
          language={LANGUAGE_MAPPING[language]?.monaco}
          onChange={(value) => {
            setCode({ ...code, [language]: value } as Record<string, string>);
          }}
          className="max-w-1/2"
        />

        <ProblemSubmitBar
          code={code[language]}
          languageId={LANGUAGE_MAPPING[language]?.judge0}
          problemId={problem.id}
          slug={problem.slug}
        />
      </div>
    </div>
  );
};
//antlr
//react-markdown

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

export const CodeSubmission = () => {
  const params = useParams();
  const slug = params.slug;
  console.log("slug", slug);
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
    <div className="grid grid-cols-2 gap-x-5 max-h-screen]">
      <div className="ml-5 mt-6 p-6 min-w-1/2 h-[calc(100vh-65px)]">
        <ProblemComponent problem={problem} />
      </div>
      <div className="flex flex-col gap-y-2 p-5">
        <LanguageSelector />
        <Editor
          defaultLanguage="Java"
          defaultValue="// Your code here"
          theme="vs-dark"
          height={"90%"}
          className="max-w-1/2"
        />
        <button
          type="button"
          className="md:w-1/3 lg:w-1/4 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none  focus:ring-blue-800 shadow-lg shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-4"
        >
          Submit
        </button>
      </div>
    </div>
  );
};
//antlr
//react-markdown

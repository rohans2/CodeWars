/* eslint-disable @typescript-eslint/no-unused-vars */
import { Editor } from "@monaco-editor/react";
import { Sidebar } from "./Sidebar";
import { LanguageSelector } from "./LanguageSelector";
import { useEffect, useState } from "react";
import { WebSocketManager } from "../utils/WebSocketManager";
import { errorType, Problem, updateType } from "../utils/types";
import axios from "axios";
import { ProblemComponent } from "./Problem";
import { LANGUAGE_MAPPING } from "../utils/constants";
import { ProblemSubmitBar } from "./ProblemSubmitBar";

interface Score {
  score: number;
  userId: string;
}

export const WarRoom = ({ room }: { room: string; password?: string }) => {
  const [connected, setConnected] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);
  const [error, setError] = useState<string>("");
  const [code, setCode] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState("cpp");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [problemStatus, setProblemStatus] = useState<string>("");

  useEffect(() => {
    setConnected(true);
    //WebSocketManager.getInstance().sendMessage({ type: "join", roomId: room });

    WebSocketManager.getInstance().registerCallback(
      "update",
      (data: updateType) => {
        setScores(data.scores);
      }
    );
    WebSocketManager.getInstance().registerCallback(
      "error",
      (data: errorType) => {
        setError(data.message);
        console.log("error");
        //WebSocketManager.getInstance().close();
      }
    );

    axios
      .get(`http://localhost:8080/api/v1/user/${"HARD"}/random-problem`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.status !== 200) {
          setProblem(null);
          return;
        }

        setProblem(res.data.problem);
      });
    return () => {
      // if (WebSocketManager.getInstance().isConnected()) {
      //   WebSocketManager.getInstance().close();
      //   WebSocketManager.getInstance().unregisterCallback("update");
      //   WebSocketManager.getInstance().unregisterCallback("error");
      // }
    };
  }, [room]);

  const handleAnswer = () => {
    WebSocketManager.getInstance().sendMessage({
      type: "answer",
      roomId: room,
    });
  };

  if (!problem) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Sidebar room={room} connected={connected} scores={scores} />
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
            problemStatus={problemStatus}
            setProblemStatus={setProblemStatus}
          />
        </div>
      </div>
    </>
  );
};

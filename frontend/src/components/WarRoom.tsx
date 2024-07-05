/* eslint-disable @typescript-eslint/no-unused-vars */
import { Editor } from "@monaco-editor/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sidebar } from "./Sidebar";
import { LanguageSelector } from "./LanguageSelector";
import { useEffect, useRef, useState } from "react";

interface Score {
  score: number;
  userId: string;
}

const waitForOpenConnection = (socket: WebSocket) => {
  return new Promise((resolve, reject) => {
    const maxNumberOfAttempts = 10;
    const intervalTime = 200; //ms

    let currentAttempt = 0;
    const interval = setInterval(() => {
      if (currentAttempt > maxNumberOfAttempts - 1) {
        clearInterval(interval);
        reject(new Error("Maximum number of attempts exceeded"));
      } else if (socket.readyState === socket.OPEN) {
        clearInterval(interval);
        resolve(true);
      }
      currentAttempt++;
    }, intervalTime);
  });
};
export const WarRoom = ({
  room,
  password,
}: {
  room: string;
  password: string;
}) => {
  const [connected, setConnected] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);
  const [error, setError] = useState<string>("");
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");
    ws.current.onopen = async () => {
      if (ws.current!.readyState !== ws.current!.OPEN) {
        try {
          await waitForOpenConnection(ws.current!);
          console.log("connected foirst");
          setConnected(true);
          ws.current!.send(
            JSON.stringify({ type: "join", roomId: room, password })
          );
        } catch (err) {
          console.error(err);
        }
      } else {
        console.log("connected");
        setConnected(true);
        ws.current!.send(
          JSON.stringify({ type: "join", roomId: room, password })
        );
      }
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "update") {
        setScores(data.scores);
      } else if (data.type === "error") {
        setError(data.message);
        ws.current!.close();
      }
    };

    ws.current.onclose = () => {
      setConnected(false);
    };

    return () => {
      //ws.current?.close();
    };
  }, [room, password]);

  const handleAnswer = () => {
    if (ws.current && connected) {
      ws.current.send(JSON.stringify({ type: "answer", roomId: room }));
    }
  };

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
  console.log("connected", connected);
  console.log("room", room);
  return (
    <>
      <Sidebar room={room} connected={connected} scores={scores} />
      <div className="grid grid-cols-2 gap-x-3 flex-1 max-h-[calc(100%-90px)]">
        <div className="ml-5 mt-6 p-6 min-w-1/2 ">
          <Markdown remarkPlugins={[remarkGfm]}>{problem.description}</Markdown>
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
            onClick={handleAnswer}
            className="md:w-1/3 lg:w-1/4 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none  focus:ring-blue-800 shadow-lg shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-4"
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
};

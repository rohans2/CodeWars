import { Editor } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
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
  const [solution, setSolution] = useState("");
  const user = useRecoilValue(userAtom);
  const [modalOpen, setModalOpen] = useState<Boolean>(false);
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


  const getSolution = async () => {
    
    setSolution("")
    setModalOpen((modalOpen) => !modalOpen);
    let response
    try {
      response = await fetch(
        `http://localhost:8080/api/v1/user/problem/requestSolution`,
        {
          method: "POST",
          body: JSON.stringify({
            problem: problem,
            language: language
          }),
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
        
        }
      )
      const reader = response.body!.getReader();
      const chunks = []
      let done, value;
      const dec = new TextDecoder("utf-8")
      
      const processStream = async () => {
        done = false;
        while(!done){
          const {value, done: readerDone } = await reader.read();
          if(value){
            const str = dec.decode(value, { stream: true })
            chunks.push(str)
            console.log(str)
            setSolution((solution) => solution + str)
          }
          done = readerDone
        }
      }

      processStream()
      
      
      console.log('solution', solution)



      // if(.status != 200){
      //   setSolution("There was an error generating the solution to the problem.")
      // }else{
      //   const reader = res.data.pipe(new TextDecoderStream()).getReader();

      //         while(true){

      //         }
      // }


    } catch (e) {
      console.log(e);

      return;
    } finally {

    }

  }

  if (!problem) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      {modalOpen &&
        <div id="extralarge-modal" tabIndex={-1} className="fixed top-2 left-0 right-0 z-50 w-full p-4 align-center overflow-x-clip overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
          <div className="relative w-full max-w-7xl h-full">

            <div className="relative bg-gray-700 rounded-lg shadow-sm ">
              {/* <!-- Modal header --> */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-600">
                <h3 className="text-xl font-medium text-white">
                  GPT's Solution
                </h3>
                <button type="button" onClick={() => {
                  setModalOpen(false);
                }} className="text-gray-400 bg-transparent hover:bg-gray-600 hover:text-white rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="extralarge-modal">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              {/* <!-- Modal body --> */}
              
              <div className="p-4 md:p-5 space-y-4">
                <Editor
                  defaultLanguage="cpp"
                  defaultValue="// Fetching the code from GPT..."
                  theme="vs-dark"
                  value={solution}
                  height={"90%"}
                  options={{
                    fontSize: 14,
                  }}
                  language={LANGUAGE_MAPPING[language]?.monaco}
                  className="h-[78vh]"
                />
              </div>
            </div>
          </div>
        </div>
      }
      <div className="grid grid-cols-2 gap-x-5 h-[90vh]">
        <div className="ml-5 mt-6  p-6 min-w-1/2 overflow-auto">
          <ProblemComponent problem={problem} />
        </div>
        <div className="flex flex-col gap-y-2 p-5 h-[85vh]">
          <div className="flex flex-row gap-x-2 p-4">
            <LanguageSelector language={language} setLanguage={setLanguage} />
            <div className="flex flex-col">
              <div className="p-3"></div>
            <button
              type="button"
              onClick={getSolution}
              // text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500
              className="text-white bg-gray-700 rounded-lg text-sm max-h-[1/2]  hover:bg-blue-700 focus:outline-none font-medium text-sm px-8 py-3 text-center m-0"
            >Generate Solution
            </button>
            </div>
          </div>
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
      

    </div>


  );
};

//antlr
//react-markdown

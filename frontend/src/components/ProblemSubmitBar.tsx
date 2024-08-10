import axios from "axios";
import { CheckIcon, CircleX, ClockIcon } from "lucide-react";
import { useRef, useState } from "react";
import { DIFFICULTY_MAPPING, SCORE_MAPPING } from "../utils/constants";
import { WebSocketManager } from "../utils/WebSocketManager";
import { Problem } from "../utils/types";

import { useToast } from "../components/ui/use-toast";

enum SubmitStatus {
  SUBMIT = "SUBMIT",
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  FAILED = "REJECTED",
}

export const ProblemSubmitBar = ({
  code,
  languageId,
  slug,
  problemId,
  problemStatus,
  setProblemStatus,
  isWarRoom,
  roomId,
  setProblem,
}: {
  code: string;
  languageId: number;
  slug: string;
  problemId: string;
  problemStatus?: string;
  setProblemStatus?: (status: string) => void;
  isWarRoom?: boolean;
  roomId?: string;
  setProblem?: (problem: Problem) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const problemNumber = useRef(1);
  const { toast } = useToast();
  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const [status, setStatus] = useState<string>(SubmitStatus.SUBMIT);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [testCases, setTestCases] = useState<any[]>([]);

  const poll = async (id: string, retries: number) => {
    if (retries === 0) {
      setStatus(SubmitStatus.SUBMIT);
      alert("Not able to submit the problem. Please try again later.");
      return;
    }

    const res = await axios.get(
      `http://localhost:8080/api/v1/user/submission/${id}`,
      {
        withCredentials: true,
      }
    );

    console.log(res.data);
    if (res.data.submission.status === SubmitStatus.PENDING) {
      setTestCases(res.data.submission.testCases);
      await new Promise((resolve) => setTimeout(resolve, 2 * 1000));
      poll(id, retries - 1);
    } else {
      if (res.data.submission.status === "ACCEPTED") {
        setStatus(SubmitStatus.ACCEPTED);
        setTestCases(res.data.submission.testCases);
        toast({
          description: "Submission accepted!",
        });
        if (setProblemStatus) setProblemStatus("ACCEPTED");
        updateScores(testCases);
        return;
      } else {
        setStatus(SubmitStatus.FAILED);
        toast({
          description: "Submission rejected :(",
          variant: "destructive",
        });
        setTestCases(res.data.submission.testCases);
        if (setProblemStatus) setProblemStatus("REJECTED");
        updateScores(testCases);
        return;
      }
    }
  };

  const updateScores = (testCases: any[]) => {
    const testCasesPassed = testCases.filter(
      (testCase) => testCase.status_id === 3
    ).length;
    const totalTestCases = testCases.length;

    console.log(testCasesPassed / totalTestCases);
    const score = Math.round(
      (testCasesPassed / totalTestCases) * SCORE_MAPPING[problemNumber.current]
    );
    WebSocketManager.getInstance().sendMessage(
      JSON.stringify({
        type: "answer",
        score,
        roomId,
      })
    );
  };

  const nextQuestion = async () => {
    console.log(problemNumber.current);
    console.log(DIFFICULTY_MAPPING[problemNumber.current]);
    const res = await axios.get(
      `http://localhost:8080/api/v1/user/${
        DIFFICULTY_MAPPING[problemNumber.current]
      }/random-problem`,
      { withCredentials: true }
    );
    problemNumber.current = problemNumber.current + 1;
    console.log(res.data);
    if (setProblem) setProblem(res.data.problem);
  };

  const submit = async () => {
    setStatus(SubmitStatus.PENDING);
    toggle();
    setTestCases((testCases) =>
      testCases.map((testCase) => ({ ...testCase, status: "PENDING" }))
    );
    try {
      const res = await axios.post(
        `http://localhost:8080/api/v1/user/problem/submit`,
        {
          code,
          languageId,
          slug,
          problemId,
        },
        {
          withCredentials: true,
        }
      );
      poll(res.data.id, 10);
    } catch (e) {
      alert("Not able to submit the problem. Please try again later.");
      console.log(e);
      setStatus(SubmitStatus.SUBMIT);
    }
  };

  return (
    <div
      id="accordion-collapse"
      data-accordion="collapse"
      className="fixed bottom-0 right-0 w-full"
    >
      <h2 id="accordion-collapse-heading-1">
        <button
          type="button"
          className="flex items-center justify-between w-full min-h-13 font-medium rtl:text-right  border border-b-0 border-gray-700    text-gray-400 bg-gray-800 "
          data-accordion-target="#accordion-collapse-body-1"
          aria-expanded="true"
          aria-controls="accordion-collapse-body-1"
        >
          {/* <svg
            data-accordion-icon
            className={`w-3 h-3 transition shrink-0 ml-5 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5 5 1 1 5"
            />
          </svg> */}
          <div>
            <button
              type="button"
              disabled={status === SubmitStatus.PENDING}
              onClick={submit}
              className="h-full text-black bg-blue-200  hover:bg-blue-100 focus:outline-none font-medium text-sm px-8 py-4 text-center m-0"
            >
              {status === SubmitStatus.PENDING ? "Running" : "Run"}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={status === SubmitStatus.PENDING}
              className="h-full text-white bg-blue-600  hover:bg-blue-700 focus:outline-none font-medium text-sm px-8 py-4 text-center m-0"
            >
              {status === SubmitStatus.PENDING ? "Submitting" : "Submit"}
            </button>
            {isWarRoom && (
              <button
                type="button"
                disabled={
                  status === SubmitStatus.PENDING || problemNumber.current === 5
                }
                onClick={
                  problemNumber.current === 5 ? showResults : nextQuestion
                }
                className="h-full text-white bg-blue-800  hover:bg-blue-900 focus:outline-none font-medium text-sm px-8 py-4 text-center m-0"
              >
                {problemNumber.current === 5 ? "Submit" : "Next"}
              </button>
            )}
          </div>
        </button>
      </h2>

      <div
        id="accordion-collapse-body-1"
        className={isOpen ? "block transition-all" : "hidden transition-all"}
        aria-labelledby="accordion-collapse-heading-1"
      >
        <div className="p-5 border border-b-0  border-gray-700 bg-gray-900 text-white">
          <div className="grid grid-cols-6 gap-4">
            {testCases.map((testcase, index) => (
              <div key={index} className="border rounded-md">
                <div className="px-2 pt-2 flex justify-center">
                  <div className="">Test #{index + 1}</div>
                </div>
                <div className="p-2 flex justify-center">
                  {renderResult(testcase.status_id)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const renderResult = (status: number | null) => {
  switch (status) {
    case 1:
      return <ClockIcon className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <ClockIcon className="h-6 w-6 text-yellow-500" />;
    case 3:
      return <CheckIcon className="h-6 w-6 text-green-500" />;
    case 4:
      return <CircleX className="h-6 w-6 text-red-500" />;
    case 5:
      return <ClockIcon className="h-6 w-6 text-red-500" />;
    case 6:
      return <CircleX className="h-6 w-6 text-red-500" />;
    case 13:
      return <div className="text-gray-300">Internal Error!</div>;
    case 14:
      return <div className="text-gray-300">Exec Format Error!</div>;
    default:
      return <div className="text-gray-300">Runtime Error!</div>;
  }
};

const showResults = () => {};

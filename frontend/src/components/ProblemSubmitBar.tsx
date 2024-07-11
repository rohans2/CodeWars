import axios from "axios";
import { CheckIcon, CircleX, ClockIcon } from "lucide-react";
import { useState } from "react";

enum SubmitStatus {
  SUBMIT = "SUBMIT",
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  FAILED = "FAILED",
}

export const ProblemSubmitBar = ({
  code,
  languageId,
  slug,
  problemId,
}: {
  code: string;
  languageId: string;
  slug: string;
  problemId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sampleTestCases = [
    {
      id: "1",
      input: "1",
      output: "1",
      status_id: 1,
    },
    {
      id: "2",
      input: "2",
      output: "2",
      status_id: 2,
    },
    {
      id: "3",
      input: "3",
      output: "3",
      status_id: 3,
    },
    {
      id: "4",
      input: "4",
      output: "4",
      status_id: 4,
    },
    {
      id: "5",
      input: "5",
      output: "5",
      status_id: 5,
    },
    {
      id: "6",
      input: "6",
      output: "6",
      status_id: 6,
    },
    {
      id: "7",
      input: "7",
      output: "7",
      status_id: 13,
    },
    {
      id: "8",
      input: "8",
      output: "8",
      status_id: 14,
    },
    {
      id: "9",
      input: "9",
      output: "9",
      status_id: 16,
    },
  ];

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const [status, setStatus] = useState<string>(SubmitStatus.SUBMIT);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [testCases, setTestCases] = useState<any[]>(sampleTestCases);

  const poll = async (id: string, retries: number) => {
    if (retries === 0) {
      setStatus(SubmitStatus.SUBMIT);
      alert("Not able to submit the problem. Please try again later.");
      return;
    }

    const res = await axios.get(
      `http://localhost:8080/api/v1/user/submission/?id=${id}`
    );

    if (res.data.submission.status === SubmitStatus.PENDING) {
      setTestCases(res.data.submission.testCases);
      await new Promise((resolve) => setTimeout(resolve, 2 * 1000));
      poll(id, retries - 1);
    } else {
      if (res.data.submission.status === "AC") {
        setStatus(SubmitStatus.ACCEPTED);
        setTestCases(res.data.submission.testCases);
        alert("Submission accepted!");
        return;
      } else {
        setStatus(SubmitStatus.FAILED);
        alert("Submission failed!");
        setTestCases(res.data.submission.testCases);
        return;
      }
    }
  };

  const submit = async () => {
    setStatus(SubmitStatus.PENDING);
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
          onClick={toggle}
          className="flex items-center justify-between w-full min-h-13 font-medium rtl:text-right  border border-b-0 border-gray-700    text-gray-400 bg-gray-800 "
          data-accordion-target="#accordion-collapse-body-1"
          aria-expanded="true"
          aria-controls="accordion-collapse-body-1"
        >
          <svg
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
          </svg>
          <div>
            <button
              type="button"
              disabled={status === SubmitStatus.PENDING}
              onClick={submit}
              className="h-full text-black bg-blue-200  hover:bg-blue-100 focus:outline-none    font-medium text-sm px-8 py-4 text-center m-0"
            >
              {status === SubmitStatus.PENDING ? "Running" : "Run"}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={status === SubmitStatus.PENDING}
              className="h-full text-white bg-blue-600  hover:bg-blue-700 focus:outline-none    font-medium text-sm px-8 py-4 text-center m-0"
            >
              {status === SubmitStatus.PENDING ? "Submitting" : "Submit"}
            </button>
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

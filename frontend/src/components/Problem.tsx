import { Example, Problem } from "../utils/types";
import { HTMLRenderer } from "./HTMLRenderer";

export const ProblemComponent = ({ problem }: { problem: Problem }) => {
  return (
    <div className="pb-20 overflow-auto">
      <h1 className="text-3xl p-1 font-bold">{problem.title}</h1>
      <div className="relative inline-flex items-center justify-center text-caption px-2.5 py-1 mt-2 gap-1 rounded-full bg-gray-700 text-[#fac31d]">
        {problem.difficulty
          ? problem.difficulty.charAt(0).toUpperCase() +
            problem.difficulty.slice(1).toLowerCase()
          : "EASY"}
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <p className="font-medium text-gray-800">
          <HTMLRenderer html={problem.description} />
        </p>
        <div className="flex flex-col gap-2 mt-2">
          {problem.examples &&
            JSON.parse(problem.examples).map(
              (example: Example, index: number) => {
                return (
                  <div>
                    <p
                      className="text-gray-900 text-md font-medium"
                      key={index}
                    >
                      Example {index + 1}:
                    </p>
                    <p className="mt-2">Input:</p>
                    <code className="mt-1 w-full text-sm sm:text-base inline-flex text-left bg-gray-800 text-white rounded-lg p-4 pl-4">
                      <span className="flex gap-4">
                        <span className="flex-1">
                          <span>{example.input}</span>
                        </span>
                      </span>
                    </code>
                    <p className="mt-1">Output:</p>
                    <code className="mt-1 text-sm sm:text-base inline-flex text-left items-center space-x-4 bg-gray-800 text-white rounded-lg p-4 pl-4">
                      <span className="flex gap-4">
                        <span className="flex-1">
                          <span>{example.output}</span>
                        </span>
                      </span>
                    </code>
                  </div>
                );
              }
            )}
        </div>
      </div>
    </div>
  );
};

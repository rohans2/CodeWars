import { useState } from "react";
import { Problem } from "../utils/types";
import axios from "axios";

export const AdminPanel = () => {
  const [problem, setProblem] = useState<Problem>({
    id: "",
    slug: "",
    title: "",
    description: "",
    difficulty: "",
    defaultCode: "",
    examples: "",
    testCases: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)]">
      <h1 className="text-4xl font-bold mt-7 ml-10 text-gray-800">
        Post a Problem
      </h1>
      <div className="flex flex-col">
        <section className="bg-white ml-10">
          <div className="py-8 px-4   lg:py-12">
            <div className="grid gap-4 sm:grid-cols-2  sm:gap-6">
              <div className="grid gap-4 sm:grid-cols-2 max-w-2xl sm:gap-6">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900 "
                  >
                    Problem title
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    onChange={(e) =>
                      setProblem({ ...problem, title: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="Problem title"
                  />
                </div>
                <div className="w-full">
                  <label
                    htmlFor="brand"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Problem slug
                  </label>
                  <input
                    type="text"
                    name="brand"
                    id="brand"
                    onChange={(e) =>
                      setProblem({ ...problem, slug: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="Problem slug"
                  />
                </div>

                <div>
                  <label
                    htmlFor="difficulty"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    defaultValue={"default"}
                    onChange={(e) =>
                      setProblem({ ...problem, difficulty: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                  >
                    <option value={"default"}>Select difficulty</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={8}
                    onChange={(e) =>
                      setProblem({ ...problem, description: e.target.value })
                    }
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your description here"
                  ></textarea>
                </div>
              </div>
              <div className="max-w-2xl grid gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="testCases"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Test Cases
                  </label>
                  <textarea
                    id="testCases"
                    rows={8}
                    onChange={(e) =>
                      setProblem({ ...problem, testCases: e.target.value })
                    }
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    placeholder='Write your test cases here in JSON format, e.g. [{"input":"","output":""}, {"input":"","output":""}]'
                  ></textarea>
                </div>

                <div className="sm:col-span-2 mt-5">
                  <label
                    htmlFor="defaultCode"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Default Code (Optional)
                  </label>
                  <textarea
                    id="defaultCode"
                    rows={8}
                    onChange={(e) =>
                      setProblem({ ...problem, defaultCode: e.target.value })
                    }
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    placeholder='Default code to be provided to the user for the problem. This code will be executed when the user clicks on the "Run" button.'
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="mt-5  mr-8">
              <label
                htmlFor="examples"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Examples (Optional)
              </label>
              <textarea
                id="examples"
                rows={8}
                onChange={(e) =>
                  setProblem({ ...problem, examples: e.target.value })
                }
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                placeholder='Write your examples here in JSON format, e.g. [{"input":"","output":""}, {"input":"","output":""}]'
              ></textarea>
            </div>
            <div className="flex justify-end w-full mt-5">
              <button
                type="submit"
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const res = await axios.post(
                      "http://localhost:8080/api/v1/admin/problem",
                      problem,
                      { withCredentials: true }
                    );
                    setIsLoading(false);
                    if (res.status === 200) {
                      alert("Problem added successfully");
                    } else {
                      alert("Something went wrong");
                    }
                  } catch (e) {
                    setIsLoading(false);
                    alert("Something went wrong");
                  }
                }}
                className="inline-flex items-center m-2 px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 hover:bg-primary-800"
              >
                {isLoading ? "Adding..." : "Add Problem"}
              </button>
              <button
                type="submit"
                className="inline-flex items-center m-2 px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-gray-800 rounded-lg focus:ring-4 focus:ring-gray-200 hover:bg-gray-600"
              >
                Publish Problem
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

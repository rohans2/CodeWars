import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Problem } from "../utils/types";
import { userAtom } from "../atoms/user";
import { useRecoilValue } from "recoil";
export const Problems = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const user = useRecoilValue(userAtom);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    axios
      .get(`http://localhost:8080/api/v1/${user.role.toLowerCase()}/problems`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data);
        if (res.status === 200) {
          console.log("problems", res.data.problems);
          setProblems(res.data.problems);
        }
      });
  }, []);

  return (
    <div>
      <h1 className="text-4xl mt-6 ml-5 p-3 font-bold">Problems.</h1>
      <div className="flex flex-wrap gap-x-5 gap-y-5 ml-6 mt-6">
        {problems.map((problem) => {
          return (
            <div className="max-w-sm w-1/2 md:w-1/4 lg:1/6 p-6 border rounded-lg drop-shadow-md bg-gray-800 border-gray-700">
              <a href="#">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
                  {problem.title.length > 20
                    ? problem.title.slice(0, 20) + "..."
                    : problem.title}
                </h5>
              </a>
              <p className="mb-3 font-normal text-gray-400">
                Difficulty:{" "}
                {problem.difficulty.charAt(0).toUpperCase() +
                  problem.difficulty.slice(1).toLowerCase()}
              </p>
              <Link
                to={`/problem/${problem.slug}`}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg focus:ring-4 focus:outline-none bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
              >
                Solve
                <svg
                  className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

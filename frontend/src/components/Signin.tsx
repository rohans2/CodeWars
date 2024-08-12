import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { userAtom } from "../atoms/user";
import { useSetRecoilState } from "recoil";
import { LoadingButton } from "./LoadingButton";

export const Signin = ({
  isSignIn,
  isAdmin,
}: {
  isSignIn: boolean;
  isAdmin?: boolean;
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const setUser = useSetRecoilState(userAtom);
  return (
    <section className="bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full  rounded-lg shadow border md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tigh md:text-2xl text-white">
              {isSignIn ? "Sign in to your account" : "Create an account"}
            </h1>
            {/* <form className="space-y-4 md:space-y-6" action="#"> */}
            {!isSignIn ? (
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-white"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                  className="border  sm:text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
            ) : null}
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-white"
              >
                Your email
              </label>
              <input
                type="email"
                name="email"
                required
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                className="border  sm:text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@doe.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium first-line:text-white"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                id="password"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="border   sm:text-sm rounded-lg  block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <a
                href="#"
                className="text-sm font-medium hover:underline text-white"
              >
                Forgot password?
              </a>
            </div>
            <button
              onClick={async () => {
                let res = null;
                setLoading(true);
                if (isSignIn) {
                  res = await axios.post(
                    isAdmin
                      ? "http://localhost:8080/api/v1/admin/signin"
                      : "http://localhost:8080/api/v1/user/signin",
                    {
                      email: email,
                      password: password,
                    },
                    {
                      withCredentials: true,
                    }
                  );
                } else {
                  res = await axios.post(
                    "http://localhost:8080/api/v1/user/signup",
                    {
                      name: name,
                      email: email,
                      password: password,
                    },
                    {
                      withCredentials: true,
                    }
                  );
                }
                setLoading(false);
                if (res.status === 200) {
                  setUser({
                    email: email,
                    name: name,
                    role: isAdmin ? "ADMIN" : "USER",
                  });
                  navigate("/problems");
                } else {
                  alert("Something went wrong");
                }
              }}
              type="submit"
              className="w-full text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-primary-600 hover:bg-primary-700 focus:ring-primary-800"
            >
              {loading ? <LoadingButton /> : isSignIn ? "Sign in" : "Sign up"}
            </button>
            <p
              onClick={() => navigate(isSignIn ? "/signup" : "/signin")}
              className="text-sm font-light  text-gray-400"
            >
              {isSignIn
                ? "Don’t have an account yet? "
                : "Already have an account? "}
              <a className="font-medium hover:underline text-primary-500 cursor-pointer">
                {isSignIn ? "Sign up" : "Login"}
              </a>
            </p>
            {/* </form> */}
          </div>
        </div>
      </div>
    </section>
  );
};

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { userAtom } from "../atoms/user";
import { useSetRecoilState } from "recoil";

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

function LoadingButton() {
  return (
    <div>
      <svg
        aria-hidden="true"
        role="status"
        className="inline w-4 h-4 me-3 text-white animate-spin"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="#E5E7EB"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentColor"
        />
      </svg>{" "}
      Loading...
    </div>
  );
}

import Lottie from "react-lottie";
import animationData from "../lotties/landingAnimation.json";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const HEADING_WORDS = ["Code", "Compete", "Conquer"];

export const Landing = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const navigate = useNavigate();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },

    speed: "2",
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (headingRef.current) {
        const words = HEADING_WORDS;
        const randomIndex = Math.floor(Math.random() * words.length);
        headingRef.current.innerHTML = words[randomIndex];
      }
    }, 2900);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen max-w-screen">
      <div className="h-screen absolute -z-1 w-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#23486F] via-[#192532] to-[#10131C]"></div>
      <div className="h-[100vh] z-10 flex flex-col ">
        <LandingAppBar />
        <div className="w-full flex h-full">
          <div className="flex flex-col z-10  justify-center w-2/5 m-20">
            <div className="w-fit ">
              <h1
                ref={headingRef}
                className="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-white text-5xl text-blue-600 font-bold pr-5"
              >
                Code
              </h1>
            </div>
            <h2 className="text-white  text-2xl font-bold mt-2">
              with your friends
            </h2>

            <p className="text-white text-md mt-2">
              Improve your coding skills by competing with friends and
              practicing together.
            </p>

            <div className="flex gap-x-4">
              <button
                type="button"
                onClick={() => {
                  navigate("/signin");
                }}
                className="text-white focus:ring-4 focus:outline-none  font-medium  text-sm px-4 py-2 my-5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/signup");
                }}
                className="text-blue-600 focus:ring-4 focus:outline-none  font-medium  text-sm px-4 py-2 my-5 text-center bg-white hover:bg-gray-200 focus:ring-gray-300"
              >
                Create Account
              </button>
            </div>
          </div>
          <div className="flex flex-col h-full items-center justify-center w-3/5">
            <div className=" transform transition hover:scale-105 duration-700 ease-in-out hover:rotate-6">
              <Lottie
                options={defaultOptions}
                height={500}
                width={600}
                isClickToPauseDisabled={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingAppBar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex flex-wrap items-center justify-between px-4 py-3   z-10">
      <a className="cursor-pointer" href="/">
        <img src="/logo.svg" className="h-8 w-28" alt="Logo" />
      </a>

      <div className="flex items-center">
        <button
          type="button"
          onClick={() => {
            navigate("/signup");
          }}
          className="text-white focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm px-4 py-2 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

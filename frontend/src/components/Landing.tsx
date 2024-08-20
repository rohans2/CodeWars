import Lottie from "react-lottie";
import animationData from "../lotties/landingAnimation.json";
import { useNavigate } from "react-router-dom";

export const Landing = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },

    speed: "2",
  };
  return (
    <div className="h-screen max-w-screen">
      <div className="h-screen absolute -z-1 w-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#23486F] via-[#192532] to-[#10131C]"></div>
      <div className="h-[100vh] z-10 flex flex-col ">
        <LandingAppBar />
        <div className="w-full flex h-full">
          <div className="flex flex-col z-10  justify-center w-2/5 m-20">
            <h1 className="text-white  text-4xl font-bold">CodeWars</h1>
            <h2 className="text-white  text-2xl font-bold">
              Compete with your friends
            </h2>
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
            navigate("/signin");
          }}
          className="text-white focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm px-4 py-2 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

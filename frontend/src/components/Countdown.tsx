import { LegacyRef, useEffect, useRef } from "react";
const Timer = ({
  countDownTime,
  setCountDownTime,
}: {
  countDownTime: number;
  setCountDownTime: (countDownTime: number) => void;
}) => {
  const secondCircle = useRef<LegacyRef<SVGCircleElement> | undefined>(null);

  useEffect(() => {
    if (countDownTime > 0) {
      const interval = setInterval(() => {
        setCountDownTime(countDownTime - 1);
      }, 1000);

      return () => clearInterval(interval); // Clear interval on component unmount
    }
  }, [countDownTime, setCountDownTime]);
  return countDownTime <= 0 ? null : (
    <div className="flex min-h-screen h-max md:h-screen flex-col md:flex-row justify-center items-center ">
      <div className="relative">
        <svg className="-rotate-90 h-48 w-48">
          <circle
            r="70"
            cx="90"
            cy="90"
            className="fill-transparent stroke-[#88adf1] stroke-[8px]"
          ></circle>
          <circle
            r="70"
            cx="90"
            cy="90"
            className=" fill-transparent stroke-white  stroke-[8px]"
            ref={secondCircle.current}
            style={{
              strokeDasharray: "451px",
            }}
          ></circle>
        </svg>
        <div className="text-white absolute top-16 left-11 text-2xl font-semibold flex flex-col items-center w-24 h-20">
          <span className="text-center">{countDownTime}</span>
          <span className="text-center">
            {countDownTime == 1 ? "Second" : "Seconds"}
          </span>
        </div>
      </div>
    </div>
  );
};
export default Timer;

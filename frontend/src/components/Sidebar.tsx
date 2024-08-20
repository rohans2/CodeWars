import { useState } from "react";
import { Room, Score } from "../utils/types";

export const Sidebar = ({
  room,
  connected,
  scores,
  setScores,
}: {
  room: Room | null;
  connected: boolean;
  scores: Score[];
  setScores: (scores: Score[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  console.log(connected);
  console.log("room details:", room);
  console.log("scores:", scores);
  return (
    <>
      {isOpen ? (
        <button
          className="flex text-4xl text-white items-center cursor-pointer fixed left-10 top-6 z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          x
        </button>
      ) : (
        <div
          className="rounded-r-full fixed left-0 top-[4.5rem]  cursor-pointer bg-gray-800 flex items-center justify-center"
          style={{ height: "40px", width: "55px" }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="fixed z-30 flex items-center  left-4 top-20"
            fill="white"
            viewBox="0 0 100 80"
            width="25"
            height="25"
          >
            <rect width="100" height="10"></rect>
            <rect y="30" width="100" height="10"></rect>
            <rect y="60" width="100" height="10"></rect>
          </svg>
        </div>
      )}

      <div
        className={`top-0 left-0 w-[40vw] bg-gray-800 ease-in-out duration-300  p-10 pr-20 text-white fixed h-full z-40 ${
          isOpen ? "translate-x-0 " : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-y-10 justify-center items-center">
          <h2>Room: {room?.name}</h2>
          <h3 className="text-xl font-semibold text-white mt-20 ">Score</h3>
          <div className="flex w-full justify-between">
            {room?.users.map((user, index) => (
              <div className="flex flex-col w-full justify-between items-center">
                <div
                  className="flex justify-center w-1/2 items-center"
                  key={user?.name || "null"}
                >
                  <h3 className="w-full text-xl font-semibold text-white flex justify-center  items-center bg-blue-600">
                    {user.name || "User " + (index + 1)}
                  </h3>
                </div>
                <div className="flex justify-center w-1/2 bg-black items-center">
                  <h4 className="w-full text-lg font-semibold text-white flex justify-center  items-center">
                    {user.score}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

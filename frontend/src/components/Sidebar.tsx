import { useState } from "react";
import { Room } from "../utils/types";

export const Sidebar = ({
  room,
  connected,
}: {
  room: Room | null;
  connected: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  console.log(connected);
  console.log("room details:", room);
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
        className={`top-0 left-0 w-[35vw] bg-gray-800 ease-in-out duration-300  p-10 pr-20 text-white fixed h-full z-40 ${
          isOpen ? "translate-x-0 " : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-y-10 justify-center items-center">
          <h2>Room: {room?.name}</h2>
          <h3 className="text-xl font-semibold text-white mt-20 ">Score</h3>
          <div className="flex w-full gap-x-20 justify-between">
            {room?.users.map((user, index) => (
              <div
                className="flex justify-center w-1/2 items-center"
                key={user?.name || "null"}
              >
                <h3 className=" text-xl font-semibold text-white">
                  {user.name || "User " + (index + 1)}
                </h3>
              </div>
            ))}
            {/* <div className="flex justify-center w-1/2 items-center">
              <h3 className=" text-xl font-semibold text-white">User 1</h3>
            </div>
            <div className="flex justify-center w-1/2 items-center">
              <h3 className=" text-xl font-semibold text-white">User 2</h3>
            </div> */}
          </div>
          <div className="flex w-full bg-red-500 gap-x-20 justify-between">
            <div className="flex justify-center w-1/2 bg-black items-center">
              <h4 className=" text-lg font-semibold text-white">2</h4>
            </div>
            <div className="flex justify-center w-1/2 bg-black items-center">
              <h4 className=" text-lg font-semibold text-white">3</h4>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

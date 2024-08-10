export const WarRoomResults = () => {
  return (
    <div>
      <h1 className="text-4xl mt-6 ml-5 p-3 font-bold">Results.</h1>
      <div className="flex gap-x-5 ml-6 mt-6 items-center justify-center">
        <div className="w-1/2 flex flex-col pb-6 items-center justify-center border-r-2 border-gray-700">
          <h2 className="text-2xl mt-6 ml-5 p-3 font-bold">User 1</h2>
          <div className="flex flex-col items-center justify-center">
            <div className="w-full flex justify-between space-x-16 border-b-2 border-gray-700">
              <h2 className="text-xl mt-6 ml-5 p-3 font-medium">Score</h2>
              <h2 className="text-xl mt-6 ml-5 p-3 font-medium">300</h2>
            </div>
            <div className="w-full flex justify-between border-b-2 space-x-16 border-gray-700">
              <h2 className="text-xl mt-2 ml-5 p-3 font-medium">
                Problems Solved
              </h2>
              <h2 className="text-xl mt-2 ml-5 p-3 font-medium">3</h2>
            </div>
            <div className="w-full flex justify-between space-x-16">
              <h2 className="text-xl mt-2 ml-5 p-3 font-medium">
                Problems Attempted
              </h2>
              <h2 className="text-xl mt-2 ml-5 p-3 font-medium">5</h2>
            </div>
          </div>
        </div>

        <div className="w-1/2 flex justify-center">
          <h2 className="text-2xl mt-6 ml-5 p-3 font-bold">
            Waiting for user 2 to Submit
          </h2>
        </div>
      </div>
      <div className="flex justify-center items-center mt-6">
        <h1 className="text-4xl mt-6 ml-5 p-3 font-bold">User 1 Wins!!</h1>
      </div>
    </div>
  );
};

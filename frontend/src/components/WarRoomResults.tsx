import { WebSocketManager } from "../utils/WebSocketManager";
import axios from "axios";
import { useEffect, useState } from "react";

interface RoomDetails {
  name?: string;
  password?: string;
  roomId: string;
  Users: RoomUser[];
}

interface RoomUser {
  id: string;
  name?: string;
  roomUserId: string;
  score: number;
  problemsSolved: number;
  problemsAttempted: number;
}

export const WarRoomResults = ({ roomId }: { roomId: string }) => {
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    WebSocketManager.getInstance().registerCallback(
      "submit",
      (data: { roomId: string }) => {
        const roomId = data.roomId;
        getRoomDetails(roomId).then((res) => {
          setRoomDetails(res.data.room);
        });
      }
    );
    setLoading(true);

    getRoomDetails(roomId).then((res) => {
      setRoomDetails(res.data.room);
      setLoading(false);
    });
  }, [setLoading, roomId]);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h1 className="text-4xl mt-6 ml-5 p-3 font-bold">Results.</h1>
          <div className="flex gap-x-5 ml-6 mt-6 items-center justify-center">
            {roomDetails?.Users.map((user, index) => (
              <div key={user.id}>
                <div className="w-1/2 flex flex-col pb-6 items-center justify-center border-r-2 border-gray-700">
                  <h2 className="text-2xl mt-6 ml-5 p-3 font-bold">
                    {user.name ? user.name : `User ${index + 1}`}
                  </h2>
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-full flex justify-between space-x-16 border-b-2 border-gray-700">
                      <h2 className="text-xl mt-6 ml-5 p-3 font-medium">
                        Score
                      </h2>
                      <h2 className="text-xl mt-6 ml-5 p-3 font-medium">
                        {user.score}
                      </h2>
                    </div>
                    <div className="w-full flex justify-between border-b-2 space-x-16 border-gray-700">
                      <h2 className="text-xl mt-2 ml-5 p-3 font-medium">
                        Problems Solved
                      </h2>
                      <h2 className="text-xl mt-2 ml-5 p-3 font-medium">
                        {user.problemsSolved}
                      </h2>
                    </div>
                    <div className="w-full flex justify-between space-x-16">
                      <h2 className="text-xl mt-2 ml-5 p-3 font-medium">
                        Problems Attempted
                      </h2>
                      <h2 className="text-xl mt-2 ml-5 p-3 font-medium">
                        {user.problemsAttempted}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {roomDetails?.Users.length === 1 && (
              <div className="w-1/2 flex justify-center">
                <h2 className="text-2xl mt-6 ml-5 p-3 font-bold">
                  Waiting for user 2 to Submit
                </h2>
              </div>
            )}
          </div>
          <div className="flex justify-center items-center mt-6">
            {roomDetails?.Users.length === 1 ? (
              <h1 className="text-4xl mt-6 ml-5 p-3 font-bold">
                Waiting for user 2 to Submit
              </h1>
            ) : roomDetails?.Users.length === 2 ? (
              renderResults(roomDetails)
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

const renderResults = (roomDetails: RoomDetails | null) => {
  const user1 = roomDetails?.Users[0];
  const user2 = roomDetails?.Users[1];
  if (user1 && user2) {
    if (user1.score > user2.score) {
      return (
        <h1 className="text-4xl mt-6 ml-5 p-3 font-bold">User 1 Wins!!</h1>
      );
    } else if (user1.score < user2.score) {
      return (
        <h1 className="text-4xl mt-6 ml-5 p-3 font-bold">User 2 Wins!!</h1>
      );
    } else {
      return <h1 className="text-4xl mt-6 ml-5 p-3 font-bold">It's a tie!</h1>;
    }
  } else {
    return null;
  }
};

const getRoomDetails = async (roomId: string) => {
  const res = await axios.get(
    `http://localhost:8080/api/v1/user/room/${roomId}`,
    {
      withCredentials: true,
    }
  );
  return res;
};

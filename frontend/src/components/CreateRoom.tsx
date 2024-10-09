import { useEffect, useState } from "react";
import { WebSocketManager } from "../utils/WebSocketManager";
import { Room } from "../utils/types";

export const CreateRoom = ({ onJoin }: { onJoin: (room: Room) => void }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  //const [roomName, setRoomName] = useState<string>("");
  //const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const instance = WebSocketManager.getInstance();
    instance.registerCallback("error", (data: { message: string }) => {
      setError(data.message);
      console.log("error");
    });
    instance.registerCallback("rooms", (data: { rooms: Room[] }) => {
      setRooms(data.rooms);
    });
    instance.registerCallback("created", (data: { room: Room }) => {
      setRooms([...rooms, data.room]);
      onJoin(data.room);
    });

    return () => {
      // if (instance.isConnected()) {
      //   // <-- This is important
      //   instance.unregisterCallback("rooms");
      //   instance.unregisterCallback("created");
      //   instance.close();
      // }
    };
  }, [onJoin, rooms]);

  const handleCreateRoom = () => {
    WebSocketManager.getInstance().sendMessage({ type: "create" });
  };

  const handleJoinRoom = async (room: Room) => {
    // const userPassword = prompt("Enter password");
    // if (userPassword) {
    console.log("join called");
    //add await to make sure the message is processed before onJoin is called
    await WebSocketManager.getInstance().sendMessage({
      type: "join",
      roomId: room.id,
    });

    console.log("error:", error);
    if (error === "" && room.users.length <= 2) {
      console.log("join called inside");
      onJoin(room);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)]">
      <h1 className="text-6xl font-bold text-gray-800">War Rooms</h1>

      <button
        type="button"
        onClick={handleCreateRoom}
        className="text-white focus:ring-4  mt-7 font-medium rounded-lg text-lg px-28 py-4 me-2 mb-2 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-blue-800"
      >
        Create new room{" "}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="flex gap-x-5 gap-y-5 mt-10 flex-wrap">
        {rooms?.map((room) => (
          <div
            key={room.id}
            onClick={() => {
              handleJoinRoom(room);
            }}
          >
            <a
              href="#"
              className="block min-w-[200px] p-5 m-2  border   rounded-lg drop-shadow-md  bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              <h5 className="text-center text-xl text-wrap font-bold tracking-tight text-white">
                {room.name
                  ? room.name.length > 13
                    ? room.name?.slice(0, 13) + "..."
                    : room.name
                  : "New Room: " + room.id.slice(0, 5)}
              </h5>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

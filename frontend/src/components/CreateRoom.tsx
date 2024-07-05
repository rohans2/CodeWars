import { useEffect, useRef, useState } from "react";
//import { useNavigate } from "react-router-dom";

const sampleRooms = [
  {
    id: 1,
    name: "War Room 1",
    description: "This is a description of the room",
    users: ["user1", "user2"],
    problems: ["problem1", "problem2", "problem3"],
  },
  {
    id: 2,
    name: "War Room 2",
    description: "This is a description of the room",
    users: ["user1", "user2"],
    problems: ["problem1", "problem2", "problem3"],
  },
  {
    id: 3,
    name: "War Room 3",
    description: "This is a description of the room",
    users: ["user1", "user2"],
    problems: ["problem1", "problem2", "problem3"],
  },
  {
    id: 4,
    name: "War Room 4 War room 4",
    description: "This is a description of the room",
    users: ["user1", "user2"],
    problems: ["problem1", "problem2", "problem3"],
  },
  {
    id: 5,
    name: "War Room 4 War room 4",
    description: "This is a description of the room",
    users: ["user1", "user2"],
    problems: ["problem1", "problem2", "problem3"],
  },
  {
    id: 6,
    name: "War Room 4 War room 4",
    description: "This is a description of the room",
    users: ["user1", "user2"],
    problems: ["problem1", "problem2", "problem3"],
  },
  {
    id: 7,
    name: "War Room 4 War room 4",
    description: "This is a description of the room",
    users: ["user1", "user2"],
    problems: ["problem1", "problem2", "problem3"],
  },
  {
    id: 8,
    name: "War Room 4 War room 4",
    description: "This is a description of the room",
    users: ["user1", "user2"],
    problems: ["problem1", "problem2", "problem3"],
  },
];
export const CreateRoom = ({
  onJoin,
}: {
  onJoin: (room: string, password: string) => void;
}) => {
  const [rooms, setRooms] = useState<string[]>([]);
  //const [roomName, setRoomName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const ws = useRef<WebSocket | null>(null);
  //const navigate = useNavigate();

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");
    ws.current.onopen = async () => {
      if (ws.current!.readyState !== ws.current!.OPEN) {
        try {
          await waitForOpenConnection(ws.current!);
          console.log("connected foirst");
          ws.current!.send(JSON.stringify({ type: "list" }));
        } catch (err) {
          console.error(err);
        }
      } else {
        console.log("connected");
        ws.current!.send(JSON.stringify({ type: "list" }));
      }
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "rooms") {
        setRooms(data.rooms);
      } else if (data.type === "created") {
        onJoin(data.roomId, password);
      }
    };
  }, [onJoin, password]);

  const handleCreateRoom = () => {
    if (password.length === 0) {
      setError("Password cannot be empty");
      return;
    }
    // const roomName =
    //   prompt("Enter room name") || `room-${Math.floor(Math.random() * 1000)}`;
    ws.current!.send(JSON.stringify({ type: "create", password }));
    setPassword("");
    //setRooms([...rooms, roomName]);
  };

  const handleJoinRoom = (room: string) => {
    const userPassword = prompt("Enter password");
    if (userPassword) {
      onJoin(room, userPassword);
    }
  };
  const waitForOpenConnection = (socket: WebSocket) => {
    return new Promise((resolve, reject) => {
      const maxNumberOfAttempts = 10;
      const intervalTime = 200; //ms

      let currentAttempt = 0;
      const interval = setInterval(() => {
        if (currentAttempt > maxNumberOfAttempts - 1) {
          clearInterval(interval);
          reject(new Error("Maximum number of attempts exceeded"));
        } else if (socket.readyState === socket.OPEN) {
          clearInterval(interval);
          resolve(true);
        }
        currentAttempt++;
      }, intervalTime);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)]">
      <h1 className="text-6xl font-bold text-gray-800">War Rooms</h1>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="button"
        onClick={handleCreateRoom}
        className="text-white focus:ring-4  mt-7 font-medium rounded-lg text-lg px-28 py-4 me-2 mb-2 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-blue-800"
      >
        Create new room{" "}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="flex gap-x-5 gap-y-5 mt-10 flex-wrap">
        {sampleRooms.map((room) => (
          <div key={room.id}>
            <a
              href="#"
              className="block min-w-[200px] p-5 m-2  border   rounded-lg drop-shadow-md  bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              <h5 className="text-center text-xl text-wrap font-bold tracking-tight text-white">
                {room.name.length > 13
                  ? room.name.slice(0, 13) + "..."
                  : room.name}
              </h5>
            </a>
          </div>
        ))}
      </div>
      --------------------------------------------------------------
      <div className="flex gap-x-5 gap-y-5 mt-10 flex-wrap">
        {rooms.map((room) => (
          <div
            key={room}
            onClick={() => {
              handleJoinRoom(room);
              //navigate(`/compete/${room.replace(/\s/g, "")}`);
            }}
          >
            <a
              href="#"
              className="block min-w-[200px] p-5 m-2  border   rounded-lg drop-shadow-md  bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              <h5 className="text-center text-xl text-wrap font-bold tracking-tight text-white">
                {room.length > 13 ? room.slice(0, 13) + "..." : room}
              </h5>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

import { CodeSubmission } from "./components/CodeSubmission";
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Signin } from "./components/Signin";
import { Problems } from "./components/Problems";
import { AppBar } from "./components/AppBar";
import { WarRoom } from "./components/WarRoom";
import { CreateRoom } from "./components/CreateRoom";
import { AdminPanel } from "./components/AdminPanel";
import { RecoilRoot } from "recoil";
import { Room } from "./utils/types";
import { WarRoomResults } from "./components/WarRoomResults";

//import { useState } from "react";

function App() {
  //const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  return (
    <div>
      <RecoilRoot>
        <BrowserRouter>
          <AppBar />
          <Routes>
            <Route path="/problem/:slug" element={<CodeSubmission />} />
            <Route path="/signin" element={<Signin isSignIn={true} />} />
            <Route
              path="/admin/signin"
              element={<Signin isSignIn={true} isAdmin={true} />}
            />
            <Route path="/signup" element={<Signin isSignIn={false} />} />
            <Route path="/problems" element={<Problems />} />
            {/* <Route path="/compete" element={<Problems />} /> */}
            <Route path="/compete/:roomId" element={<WarRoomWrapper />} />
            <Route path="/rooms" element={<CreateRoomWrapper />} />
            <Route path="/admin/post" element={<AdminPanel />} />
            <Route
              path="/compete/:roomId/results"
              element={<WarRoomResults />}
            />
          </Routes>
        </BrowserRouter>
      </RecoilRoot>
      {/* <CodeSubmission /> */}
    </div>
  );
}

const CreateRoomWrapper = () => {
  const navigate = useNavigate();
  const handleJoin = (room: Room) => {
    navigate(`/compete/${room.id}`);
  };

  return <CreateRoom onJoin={handleJoin} />;
};

const WarRoomWrapper = () => {
  const params = useParams();
  const { roomId } = params;
  if (roomId) {
    return <WarRoom room={roomId} />;
  }
};

export default App;

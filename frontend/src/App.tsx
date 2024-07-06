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
            <Route
              path="/compete/:roomId/:password"
              element={<WarRoomWrapper />}
            />
            <Route path="/rooms" element={<CreateRoomWrapper />} />
            <Route path="/admin/post" element={<AdminPanel />} />
          </Routes>
        </BrowserRouter>
      </RecoilRoot>
      {/* <CodeSubmission /> */}
    </div>
  );
}

const CreateRoomWrapper = () => {
  const navigate = useNavigate();
  const handleJoin = (roomId: string, password: string) => {
    navigate(`/compete/${roomId}/${password}`);
  };

  return <CreateRoom onJoin={handleJoin} />;
};

const WarRoomWrapper = () => {
  const params = useParams();
  const { roomId, password } = params;
  if (roomId && password) {
    return <WarRoom room={roomId} password={password} />;
  }
};

export default App;

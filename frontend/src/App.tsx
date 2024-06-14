import { CodeSubmission } from "./components/CodeSubmission";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Signin } from "./components/Signin";
import { Problems } from "./components/Problems";
import { AppBar } from "./components/AppBar";

function App() {
  return (
    <div>
      <AppBar />
      <BrowserRouter>
        <Routes>
          <Route path="/problem/:id" element={<CodeSubmission />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/problems" element={<Problems />} />
        </Routes>
      </BrowserRouter>
      {/* <CodeSubmission /> */}
    </div>
  );
}

export default App;

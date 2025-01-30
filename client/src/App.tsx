import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Fragment, useState } from "react";
import useStore from "./middlewares/stores/store";
function App() {
  const [email, setEmail] = useState("");
  const auth = useStore((state) => state.auth);
  const user = useStore((state) => state.user);
  const initialize = useStore((state) => state.initialize);
  const logout = useStore((state) => state.logout);
  async function register() {
    // TODO: Implement registration
  }

  async function login() {
    // TODO: Implement login
  }
  return (
    <Fragment>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Passkey with VITE + REACT</h1>

      {auth ? (
        <div className="container">
          <h1>Welcome {user}</h1> <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div className="container">
          <input
            style={{ fontSize: "16px", padding: "10px" }}
            type="text"
            placeholder="Enter email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <button type="submit" disabled={!email} onClick={register}>
            Register
          </button>
          <button type="submit" disabled={!email} onClick={login}>
            Login
          </button>
        </div>
      )}
    </Fragment>
  );
}

export default App;

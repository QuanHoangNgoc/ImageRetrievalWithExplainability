import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.scss";
import { stateUri } from "./libs/library";
import Homepage from "./pages/home";
import { setStateId } from "./redux/reducers/searchSlice";
import { RootState } from "./redux/store";

function App() {
  const dispatch = useDispatch();
  const { stateId } = useSelector((state: RootState) => state.searchManager);

  useEffect(() => {
    const fetchStateId = async () => {
      const res = await axios.get(stateUri);

      console.log(res.data.reply);
      dispatch(setStateId(res.data.reply));
    };

    fetchStateId();
  }, []);

  useEffect(() => {
    const deleteStateId = async () => {
      console.log(stateId);

      const res = await axios.delete(`${stateUri}/${stateId}`);
      console.log(res);
    };

    const windowUnload = async (e) => {
      e.preventDefault();
      await deleteStateId();
      return (e.returnValue = "Are you sure you want to exit");
    };

    window.addEventListener("beforeunload", windowUnload);

    return () => {
      window.removeEventListener("beforeunload", windowUnload);
    };
  }, [stateId]);

  return <div className="App">{<Homepage />}</div>;
  // <div className="App">{stateId && <Homepage />}</div>;
}

export default App;

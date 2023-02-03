import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setSessionId } from "../../redux/reducers/searchSlice";
import styles from "./SessionInput.module.scss";
const SessionInput = (props) => {
  const [inputValue, setInputValue] = useState("");
  const dispatch = useDispatch();

  const _handleOnChange = (e) => {
    setInputValue(e.target.value);
  };

  const _handleClick = () => {
    dispatch(setSessionId(inputValue));
    sessionStorage.setItem("sessionId", inputValue);
  };

  useEffect(() => {
    const sessionId = sessionStorage.getItem("sessionId");
    if (sessionId)
      dispatch(setSessionId(sessionId));
  }, [dispatch])

  const _handleEnter = (e) => {
    if (e.key === "Enter") {
      _handleClick();
    }
  }


  return (
    <div className={styles.sessionWrapper}>
      {/* <label htmlFor="">Session id: </label> */}
      <div className={styles.inputWrapper}>
        <input onKeyDown={_handleEnter} className={styles.inputSession} placeholder="Session id" type="text" value={inputValue} onChange={_handleOnChange} />
      </div>

      <button className={styles.inputSessionBtn} onClick={_handleClick}>
        Save
      </button>
    </div>
  );
};

export default SessionInput;

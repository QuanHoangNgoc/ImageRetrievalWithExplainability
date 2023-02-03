import React, { useEffect, useState } from "react";
import { ResultPaginate, TextField } from "../../components";
import styles from "./Homepage.module.scss";
import ViewOption from "../../components/ViewOption";
import { HomepageProps, ListDirHandler } from "../../share/types";
import Loader from "react-spinners/ClipLoader";
import QuantityOption from "../../components/QuantityOption";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import ImportImage from "../../components/ImportImage";
import { stateUri } from "../../libs/library";
import MuiTextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import {
  clearMultiSelectItems,
  setActiveItem,
  setCtrlIsPressed,
  setFilter,
  setShiftIsPressed,
} from "../../redux/reducers/searchSlice";
import SessionInput from "../../components/SessionInput/SessionInput";
import { keywords } from "../../libs/library";
import axios from "axios";

const Homepage: React.FC<HomepageProps> = () => {
  const [isSearch, setIsSearch] = useState<boolean>(false);

  const [folderHandle, setFolderHandle] = useState<ListDirHandler>();
  const {
    items,
    sessionId,
    stateId,
    firstLoading,
    viewType,
    ctrlIsPressed,
    shiftIsPressed,
    filter,
    searchType,
  } = useSelector((state: RootState) => state.searchManager);

  const [filterData, setFilterData] = useState("");

  const activeItem = useSelector(
    (state: RootState) => state.searchManager.activeItem
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (activeItem !== "") {
      dispatch(setActiveItem(""));
      dispatch(clearMultiSelectItems());
    }
  }, [items]);

  useEffect(() => {
    const handleCtrlKeyDown = (e: any) => {
      if (e.keyCode === 17) {
        if (!ctrlIsPressed) {
          dispatch(setCtrlIsPressed(true));
        }
      }

      if (e.keyCode === 16) {
        if (!shiftIsPressed) {
          console.log("shift is pressed");
          dispatch(setShiftIsPressed(true));
        }
      }
    };

    const handleCtrlKeyUp = (e: any) => {
      if (e.keyCode === 17) {
        if (ctrlIsPressed) {
          dispatch(setCtrlIsPressed(false));
        }
      }

      if (e.keyCode === 16) {
        if (shiftIsPressed) {
          console.log("shiftIsReleased");
          dispatch(setShiftIsPressed(false));
        }
      }
    };

    document.addEventListener("keyup", handleCtrlKeyUp);
    document.addEventListener("keydown", handleCtrlKeyDown);
    return () => {
      document.removeEventListener("keyup", handleCtrlKeyUp);
      document.removeEventListener("keydown", handleCtrlKeyDown);
    };
  }, [ctrlIsPressed, shiftIsPressed]);

  useEffect(() => {
    console.log(filter);
  }, [filter]);

  useEffect(() => {
    if (sessionId) {
      console.log("Session ID is", sessionId);
      console.log("State ID is", stateId);
      axios.post(`${stateUri}/${stateId}`, {
        sessionId: sessionId,
      }).then(function (response) {
        console.log("Submit session ID to backend returned", response);
      })
    }
  }, [sessionId]);

  // Render
  return (
    <div
      className={
        items.length > 0
          ? `${styles.wrapper} ${styles.raiseWater}`
          : `${styles.wrapper}`
      }
    >
      {!sessionId && (
        <div className={styles.importWrapper}>
          <SessionInput />
        </div>
      )}

      {sessionId && (
        <div
          className={
            isSearch
              ? `${styles.contentWrapper} ${styles.contentWrapperSearched}`
              : styles.contentWrapper
          }
        >
          <TextField
            isSearch={isSearch}
            setIsSearch={setIsSearch}
            folderHandle={folderHandle}
          />

          {isSearch && (
            <div className={styles.options}>
              {searchType === "text" && (
                <Autocomplete
                  freeSolo
                  options={keywords}
                  onInputChange={(e, value) => dispatch(setFilter(value))}
                  onChange={(e, value) => dispatch(setFilter(value))}
                  value={filter ? filter : ""}
                  renderInput={(params) => (
                    <MuiTextField
                      {...params}
                      label="Filter"
                      className={styles.filterInput}
                    />
                  )}
                  className={styles.filterInputContainer}
                />
              )}

              {searchType === "file" && <div></div>}

              <QuantityOption />
            </div>
          )}

          {!firstLoading && isSearch && viewType === "default" && (
            <div>
              <ResultPaginate folderHandle={folderHandle} />
            </div>
          )}

          {firstLoading && (
            <div className={styles.loadingWrapper}>
              <Loader loading={firstLoading} size={100} color="#0071FF" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Homepage;

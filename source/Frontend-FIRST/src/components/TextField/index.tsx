import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./TextField.module.scss";
import { BiSearch } from "react-icons/bi";
import { TextFieldProps } from "../../share/types";
import { useDispatch, useSelector } from "react-redux";

import {
  changeFirstLoading,
  changeSearchTerm,
  changeSearchType,
  changeTotalResult,
  replaceItems,
  clearReadItem,
  setIsFocusInput,
} from "../../redux/reducers/searchSlice";
import { RootState } from "../../redux/store";
import axios from "axios";
import { searchUri } from "../../libs/library";

const TextField: React.FC<TextFieldProps> = ({
  isSearch,
  setIsSearch,
  folderHandle,
}) => {
  const dispatch = useDispatch();

  const inputTextRef = useRef<HTMLInputElement>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { searchType, isFocusInput, stateId, filter } = useSelector(
    (state: RootState) => state.searchManager
  );

  const [inputData, setInputData] = useState<string>("");
  const _onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.includes("`")) return;

    setInputData(e.target.value);
  };

  // const getAllData = async (data: any) => {
  //   const newData = await urlGenerator(folderHandle, data);
  //   dispatch(addReadItem(newData));
  // }

  const fetchData = async (inputData: string) => {
    if (isSearch === false) setIsSearch(true);

    dispatch(changeSearchTerm(inputData));

    dispatch(changeFirstLoading(true));
    // Fetch data
    try {
      // const res = await axios({
      //   method: "POST",
      //   data: {
      //     text: inputData,
      //     state_id: stateId,
      //     filter,
      //   },
      //   url: searchUri,
      // });

      const res = await axios({
        method: "GET",
        params: {
          text: inputData,
          state_id: stateId,
          filter,
        },
        url: searchUri,
      });

      const data = res.data;
      console.log(data);
      dispatch(changeTotalResult(data.reply.shots.length));
      dispatch(replaceItems(data.reply.shots));
      dispatch(clearReadItem());
      // console.log(data.reply.shots);
      // const imageUrls = await urlGenerator(folderHandle, data.reply.shots)
      // if (imageUrls)
      //   dispatch(replaceItems(imageUrls));
      dispatch(changeFirstLoading(false));

      // Cho chạy ngầm
      // console.log("before start function getAllData");
      // getAllData(data.reply.shots);
      // console.log("after start function getAllData");
    } catch (error: any) {
      throw Error(error);
    }
  };

  const toBase64 = (file: any) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const fetchDataByFile = async (file: any) => {
    if (!file) return;
    dispatch(changeFirstLoading(true));
    const b64Data = (await toBase64(file)) as string;
    const splitData = b64Data.split(",")[1];
    const res = await axios.post(searchUri, {
      image_encoded: splitData,
      state_id: stateId,
    });
    const data = res.data;
    dispatch(changeTotalResult(data.reply.shots.length));
    dispatch(clearReadItem());
    dispatch(replaceItems(data.reply.shots));
    dispatch(changeFirstLoading(false));
    if (isSearch === false) setIsSearch(true);
    dispatch(changeFirstLoading(false));
  };

  const _clickSearchHandle = () => {
    if (searchType === "text") {
      if (!inputData.trim()) return;
      const newSearchType = document.querySelector<HTMLInputElement>(
        "select[name='choices']"
      )?.value;

      if (newSearchType) dispatch(changeSearchType(newSearchType));

      fetchData(inputData);
    } else {
      if (inputFileRef.current) {
        const file = inputFileRef.current.files[0];
        if (!file) return;
        fetchDataByFile(file);
      }
    }
  };

  const _onKeyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    if (key === "Enter") {
      return _clickSearchHandle();
    }
    if (key === "`") {
      return false;
    }
  };

  const _handleOptionChange = (e) => {
    dispatch(changeSearchType(e.target.value));
  };

  const handleKeyUp = useCallback(
    (e) => {
      if (e.keyCode === 9) {
        return;
      }
      if (e.keyCode === 192) {
        if (isFocusInput) {
          inputTextRef.current.blur();
          return;
        }
        inputTextRef.current.focus();
        return;
      }
      // if (e.keyCode === 13) {
      //   inputTextRef.current.blur();
      //   return;
      // }
    },
    [isFocusInput]
  );

  useEffect(() => {
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyUp]);

  useEffect(() => {
    const _handleInputFocus = () => {
      dispatch(setIsFocusInput(true));
    };

    const _handleInputFocusOut = () => {
      dispatch(setIsFocusInput(false));
    };
    if (inputTextRef.current) {
      inputTextRef.current.addEventListener("focusin", _handleInputFocus);

      inputTextRef.current.addEventListener("focusout", _handleInputFocusOut);
    }
    return () => {
      if (inputTextRef.current) {
        inputTextRef.current.removeEventListener("focusin", _handleInputFocus);

        inputTextRef.current.removeEventListener(
          "focusout",
          _handleInputFocusOut
        );
      }
    };
  }, [inputTextRef]);
  return (
    <>
      <div className={styles.wrapper}>
        {searchType === "text" && (
          <div
            className={
              !isSearch
                ? `${styles.inputWrapper}`
                : `${styles.inputWrapperSearch}`
            }
          >
            <BiSearch
              size={!isSearch ? 24 : 20}
              className={
                !isSearch
                  ? `${styles.searchIcon}`
                  : `${styles.searchIconSearch}`
              }
            />
            <input
              ref={inputTextRef}
              className={styles.input}
              value={inputData}
              onChange={_onChangeHandler}
              type="text"
              onKeyDown={_onKeyDownHandler}
              placeholder="Description or keywords..."
            />
          </div>
        )}

        {searchType === "file" && (
          <div>
            <input type="file" ref={inputFileRef} />
          </div>
        )}
        <div className={styles.searchOptions}>
          <div
            className={
              !isSearch
                ? `${styles.dropdownWrapper}`
                : `${styles.dropdownWrapperSearch}`
            }
          >
            <select
              className={styles.typeSelect}
              name="choices"
              onChange={_handleOptionChange}
            >
              <option value="text">Text</option>
              <option value="file">File</option>

              {/* <option value="videos">Video</option> */}
            </select>
          </div>
          <button
            className={
              !isSearch ? `${styles.CTAbutton}` : `${styles.CTAbuttonSearch}`
            }
            onClick={_clickSearchHandle}
          >
            Search
          </button>
        </div>
      </div>
    </>
  );
};

export default TextField;

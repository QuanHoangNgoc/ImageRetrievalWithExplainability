// import { Button, Radio, RadioChangeEvent } from 'antd';
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeView } from "../../redux/reducers/searchSlice";
import { RootState } from "../../redux/store";
import { ViewOptionProps } from "../../share/types";
import styles from "./ViewOption.module.scss";
const ViewOption: React.FC<ViewOptionProps> = () => {
  // Redux state

  const dispatch = useDispatch();
  const viewType = useSelector(
    (state: RootState) => state.searchManager.viewType
  );

  return (
    <div className={styles.viewControl}>
{/*      
      <div key="default">
        <label className={viewType === "default" ? `${styles.selected}` : ``}>
          <input
            type="radio"
            checked={viewType === "default"}
            onChange={() => dispatch(changeView("default"))}
          />
          Default
        </label>
      </div> */}
    </div>
  );
};

export default ViewOption;

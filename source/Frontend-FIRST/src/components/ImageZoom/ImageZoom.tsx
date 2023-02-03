import React, { useState } from "react";
import styles from "./ImageZoom.module.scss";
import { BsFullscreenExit } from "react-icons/bs";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { submitImage } from "../../libs/library";
import Prompt from "../Prompt/Prompt";

const ImageZoom = ({ item, handleExitFullScreen }) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const { sessionId, stateId } = useSelector(
    (state: RootState) => state.searchManager
  );

  const _handleSubmitImage = () => {
    setIsSubmit(true);
  };
  return (
    <div>
      <div className={styles.zoomContainer}>
        <img src={item.path} alt="" />
        <div onClick={() => handleExitFullScreen()}>
          <BsFullscreenExit size="3em" className={styles.exitFullScreenIcon} />
        </div>
        <button onClick={() => _handleSubmitImage()}>Submit Image</button>
      </div>

      {isSubmit && (
        <Prompt
          objectImage={item}
          acceptFunction={() => {
            // submitImage(items[currentIndex], 'sessionIDFake')
            submitImage([item], sessionId, stateId);
            setIsSubmit(false);
          }}
          cancelFunction={() => {
            setIsSubmit(false);
          }}
        />
      )}
    </div>
  );
};

export default ImageZoom;

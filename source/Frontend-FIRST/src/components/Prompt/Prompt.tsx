import React, { useState } from "react";
import styles from "./Prompt.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {BsFillCaretLeftFill, BsFillCaretRightFill} from "react-icons/bs"

const Prompt = ({ objectImage, acceptFunction, cancelFunction }) => {
  const { multiSelectItems } = useSelector(
    (state: RootState) => state.searchManager
  );
  const [imageDisplay, setImageDisplay] = useState(0)
  const _handleCancelClick = () => {
    if (cancelFunction) {
      cancelFunction();
      return;
    }

    console.log(multiSelectItems);
  };

  const _handleAcceptClick = () => {
    if (acceptFunction) {
      acceptFunction();
      return;
    }
    console.log(multiSelectItems);
  };

  const _handleButtonPrev = () => {
    if (imageDisplay > 0)
      setImageDisplay(imageDisplay - 1)
  }

  const _handleButtonNext = () => {
    if (imageDisplay < objectImage.length - 1)
      setImageDisplay(imageDisplay + 1)
  }

  const isArray = Array.isArray(objectImage);

  return (
    <>
      {!isArray && (
        <div className={styles.prompt}>
          <div className={styles.layout} onClick={() => _handleCancelClick}></div>
          <div className={styles.info}>
            <p className={styles.message}>Submit image</p>
            <p>
              Image name: <span className={styles.name}>{objectImage.name}</span>
            </p>
            <img src={objectImage.path} alt="" />
            <div className={styles.buttons}>
              <button onClick={_handleAcceptClick}>Submit</button>
              <button className={styles.cancelBtn} onClick={_handleCancelClick}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {
        isArray && objectImage.length === 1 && (
          <div className={styles.prompt}>
            <div className={styles.layout} onClick={() => _handleCancelClick}></div>
            <div className={styles.info}>
              <p className={styles.message}>Submit image</p>
              <p>
                Image name: <span className={styles.name}>{objectImage[0].name}</span>
              </p>
              <img src={objectImage[0].path} alt="" />
              <div className={styles.buttons}>
                <button onClick={_handleAcceptClick}>Submit</button>
                <button className={styles.cancelBtn} onClick={_handleCancelClick}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }
      {
        isArray && objectImage.length > 1 && (
          <div className={styles.prompt}>
            <div className={styles.layout} onClick={() => _handleCancelClick}></div>
            <div className={styles.info}>
              <p className={styles.message}>Submit image</p>
              <p className={styles.imageName}>
                Image name: <span className={styles.name}>{objectImage[imageDisplay].name}</span> and {objectImage.length - 1} others
              </p>
              <ul>
                <button className={styles.prevBtn} onClick={_handleButtonPrev}><BsFillCaretLeftFill /></button>
                {objectImage.map((image, index) => {
                  return <li key={`${image.name}_${index}`} className={index !== imageDisplay ? styles.noDisplay : ""}><img src={image.path} alt="" /></li>
                })}
                <button className={styles.nextBtn} onClick={_handleButtonNext}><BsFillCaretRightFill/></button>
              </ul>

              <div className={styles.buttons}>
                <button onClick={_handleAcceptClick}>Submit</button>
                <button className={styles.cancelBtn} onClick={_handleCancelClick}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>


  );
};


export default Prompt
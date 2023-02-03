import React, { useEffect, useRef, useState } from "react";
import styles from "./ImageHandle.module.scss";
import { FiSend } from "react-icons/fi";
import { BiCrop, BiSearch } from "react-icons/bi";
import { BsFullscreenExit } from "react-icons/bs";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { CgFilm } from "react-icons/cg";
import { ImageHandleProps } from "../../share/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import axios from "axios";
import { searchUri, submitImage } from "../../libs/library";
import {
  changeFirstLoading,
  clearReadItem,
  replaceItems,
} from "../../redux/reducers/searchSlice";
import "cropperjs/dist/cropper.css";
import Prompt from "../Prompt/Prompt";
import ImageZoom from "../ImageZoom/ImageZoom";
import ImageCrop from "../ImageCrop/ImageCrop";

const ImageHandle: React.FC<ImageHandleProps> = ({
  handleFullScreenImage,
  folderHandle,
}) => {
  const { items, sessionId, multiSelectItems, stateId } = useSelector(
    (state: RootState) => state.searchManager
  );

  const selectItem = useSelector(
    (state: RootState) => state.searchManager.activeItem
  );
  const [isCrop, setIsCrop] = useState(false);
  const cropRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isZoom, setIsZoom] = useState(false);
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    if (
      !selectItem ||
      multiSelectItems.length > 1 ||
      multiSelectItems.length === 0
    )
      setDisable(true);
    else {
      setDisable(false);
    }
  }, [multiSelectItems, selectItem]);

  const dispatch = useDispatch();

  const searchByImage = async () => {
    dispatch(changeFirstLoading(true));
    try {
      const res = await axios({
        method: "GET",
        params: {
          shot_name: selectItem.name,
          state_id: stateId,
        },
        url: searchUri,
      });
      dispatch(clearReadItem());
      const data = res.data.reply.shots;
      if (data) dispatch(replaceItems(data));
      // const imageUrl = await urlGenerator(folderHandle, data);
      // if (imageUrl)
      //     dispatch(replaceItems(imageUrl));
    } catch (e) {
      throw new Error("Error Search By Image");
    }
    dispatch(changeFirstLoading(false));
  };

  const cropImage = () => {
    setIsCrop(true);
  };

  useEffect(() => {
    if (cropRef.current) cropRef.current.requestFullscreen();
  }, [isCrop]);

  const _handleExitFullScreen = () => {
    if (!document.fullscreenElement) {
      setIsCrop(false);
    }
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", _handleExitFullScreen);

    return () => {
      document.removeEventListener("fullscreenchange", _handleExitFullScreen);
    };
  }, []);

  const handleExitFullScreen = () => {
    document.exitFullscreen();
  };

  const _handleSubmitImage = () => {
    setIsSubmit(true);
  };

  const _handleZoom = () => {
    // setIsSubmit(true);
    setIsZoom(true);
  };
  const _handleFullScreen = () => {
    if (!document.fullscreenElement) {
      setIsZoom(false);
    }
  };

  useEffect(() => {
    if (zoomRef.current) {
      if (isZoom) zoomRef.current.requestFullscreen();
    }
  }, [isZoom]);

  useEffect(() => {
    document.addEventListener("fullscreenchange", _handleFullScreen);
    return () => {
      document.removeEventListener("fullscreenchange", _handleFullScreen);
    };
  }, [isZoom]);

  return (
    <>
      {!isCrop && !isZoom && (
        <ul className={styles.optionButtons}>
          {selectItem ? <span>{selectItem.name}</span> : <p>Image Name</p>}
          <button
            data-tooltip="Submit image"
            disabled={!selectItem}
            className={
              !selectItem
                ? `${styles.disabled} ${styles.option}`
                : `${styles.option}`
            }
            onClick={() => _handleSubmitImage()}
          >
            <FiSend />
          </button>
          <button
            data-tooltip="Zoom image"
            disabled={disable}
            className={
              disable
                ? `${styles.disabled} ${styles.option}`
                : `${styles.option}`
            }
            onClick={() => _handleZoom()}
          >
            <MdOutlineZoomOutMap />
          </button>

          <button
            data-tooltip="Search by image"
            disabled={disable}
            className={
              disable
                ? `${styles.disabled} ${styles.option}`
                : `${styles.option}`
            }
            onClick={() => {
              searchByImage();
            }}
          >
            <BiSearch />
          </button>
          <button
            data-tooltip="Crop image"
            disabled={disable}
            className={
              disable
                ? `${styles.disabled} ${styles.option}`
                : `${styles.option}`
            }
            onClick={cropImage}
          >
            <BiCrop />
          </button>
          <button
            data-tooltip="Get clip"
            disabled={disable}
            className={
              disable
                ? `${styles.disabled} ${styles.option}`
                : `${styles.option}`
            }
            onClick={() => handleFullScreenImage(selectItem.name)}
          >
            <CgFilm />
          </button>
        </ul>
      )}

      {isSubmit && (
        <Prompt
          objectImage={multiSelectItems}
          acceptFunction={() => {
            // submitImage(items[currentIndex], 'sessionIDFake')
            submitImage(multiSelectItems, sessionId, stateId);
            setIsSubmit(false);
          }}
          cancelFunction={() => {
            setIsSubmit(false);
          }}
        />
      )}

      {isZoom && (
        <div className={styles.imageZoom} ref={zoomRef}>
          <ImageZoom
            item={selectItem}
            handleExitFullScreen={handleExitFullScreen}
          />
        </div>
      )}

      {isCrop && (
        <div className={styles.imageCrop} ref={cropRef}>
          <ImageCrop
            item={selectItem}
            handleExitFullScreen={handleExitFullScreen}
          />
        </div>
      )}
    </>
  );
};

export default ImageHandle;

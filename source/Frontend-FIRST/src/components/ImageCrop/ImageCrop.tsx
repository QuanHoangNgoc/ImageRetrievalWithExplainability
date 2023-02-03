import React, { useRef } from "react";
import styles from "./ImageCrop.module.scss";
import { Cropper } from "react-cropper";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { searchUri } from "../../libs/library";
import {
  changeFirstLoading,
  clearReadItem,
  replaceItems,
} from "../../redux/reducers/searchSlice";
import { BsFullscreenExit } from "react-icons/bs";
import { RootState } from "../../redux/store";

const ImageCrop = ({ item, handleExitFullScreen }) => {
  const dispatch = useDispatch();
  const { stateId } = useSelector((state: RootState) => state.searchManager);
  const cropperRef = useRef<HTMLImageElement>(null);

  const sendCropData = async () => {
    const imageElement: any = cropperRef?.current;
    const cropper: any = imageElement?.cropper;

    const imageWidth = cropper.getImageData().naturalWidth;
    const imageHeight = cropper.getImageData().naturalHeight;

    dispatch(changeFirstLoading(true));

    try {
      const res = await axios.get(searchUri, {
        params: {
          crop: {
            left: cropper.getData().x / imageWidth,
            upper: cropper.getData().y / imageHeight,
            lower: (cropper.getData().x + cropper.getData().width) / imageWidth,
            right:
              (cropper.getData().y + cropper.getData().height) / imageHeight,
          },
          shot_name: item.name,
          state_id: stateId,
        },
      });
      dispatch(clearReadItem());
      dispatch(replaceItems(res.data.reply.shots));
    } catch (e) {
      throw Error(e);
    }
    dispatch(changeFirstLoading(false));

    if (document.fullscreenElement) document.exitFullscreen();
  };

  return (
    <div className={styles.cropContainer}>
      <Cropper
        src={item.path}
        style={{ height: "60%", width: "60%" }}
        initialAspectRatio={16 / 9}
        guides={false}
        ref={cropperRef}
        viewMode={1}
        zoomable={false}
      />
      <div onClick={handleExitFullScreen}>
        <BsFullscreenExit size="3em" className={styles.exitFullScreenIcon} />
      </div>
      <button onClick={sendCropData}>Get Images</button>
    </div>
  );
};

export default ImageCrop;

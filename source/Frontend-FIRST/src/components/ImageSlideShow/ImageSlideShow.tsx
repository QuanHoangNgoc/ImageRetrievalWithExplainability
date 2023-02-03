import React, {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import { ImageSlideShowProps } from "../../share/types";
import styles from "./ImageSlideShow.module.scss";
import { BsArrowsCollapse, BsFullscreenExit } from "react-icons/bs";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import {
  defaultDetail,
  imageUrl,
  searchUri,
  submitImage,
} from "../../libs/library";
import { v4 as uuidv4, v4 } from "uuid";
import { RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import Prompt from "../Prompt/Prompt";
import {
  addSelectItems,
  changeFirstLoading,
  clearMultiSelectItems,
  clearReadItem,
  replaceItems,
  setActiveItem,
  setSelectItems,
} from "../../redux/reducers/searchSlice";
import { FiSend } from "react-icons/fi";
import { MdOutlineViewModule, MdOutlineViewSidebar } from "react-icons/md";
import ResultItem from "../ResultItem/index";
import { BiSearch } from "react-icons/bi";
import { FaSearchMinus, FaSearchPlus } from "react-icons/fa";
import axios from "axios";
import Loader from "react-spinners/ClipLoader";
let timeOut: any = null;
const ImageSlideShow: React.FC<ImageSlideShowProps> = ({
  items,
  setIsFullScreen,
  startIndex,
  handleModeChange,
  mode,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // const [view,setView] = useState("Horizontal");
  const [view, setView] = useState("Vertical");
  const [sliderValue, setSliderValue] = useState(defaultDetail);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const selectItem = useSelector(
    (state: RootState) => state.searchManager.activeItem
  );
  const {
    stateId,
    sessionId,
    ctrlIsPressed,
    multiSelectItems,
    shiftIsPressed,
  } = useSelector((state: RootState) => state.searchManager);

  const thumbnailRef = useRef<HTMLUListElement>(null);
  const _handleThumbnailClick = (index: number, item: any) => {
    if (ctrlIsPressed) {
      //Neu da co active item
      if (selectItem) {
        //Xet neu item duoc bam da duoc select truoc do hay chua
        const alreadySelected = multiSelectItems.findIndex(
          (selectItem) => selectItem.name === item.name
        );

        //Neu duoc select trc roi thi xoa di
        if (alreadySelected > -1) {
          if (multiSelectItems.length === 1) return;

          const newSelectItems = [...multiSelectItems];
          newSelectItems.splice(alreadySelected, 1);
          dispatch(setSelectItems(newSelectItems));
          if (item.name === selectItem.name)
            dispatch(setActiveItem(newSelectItems[0]));

          //  Neu chua select thi select
        } else {
          dispatch(addSelectItems(item));
          dispatch(setActiveItem(item));
        }
      } else {
        dispatch(clearMultiSelectItems());
        dispatch(addSelectItems(item));
        dispatch(setActiveItem(item));
      }
      return;
    }

    if (shiftIsPressed) {
      if (selectItem) {
        const activeIndex = items.findIndex((listItem) => {
          return listItem.name === selectItem.name;
        });
        const clickIndex = items.findIndex(
          (listItem) => listItem.name === item.name
        );

        console.log(activeIndex, clickIndex);
        dispatch(clearMultiSelectItems);

        const newSelectItems =
          activeIndex < clickIndex
            ? items.slice(activeIndex, clickIndex + 1)
            : items.slice(clickIndex, activeIndex + 1);
        dispatch(clearMultiSelectItems());

        dispatch(setSelectItems(newSelectItems));
      } else {
        dispatch(clearMultiSelectItems());
        dispatch(addSelectItems(item));
        dispatch(setActiveItem(item));
      }
      return;
    }
    dispatch(clearMultiSelectItems());
    dispatch(setActiveItem(item));
    dispatch(addSelectItems(item));
  };

  useEffect(() => {
    const itemIndex = items.findIndex((item) => selectItem.name === item.name);
    setCurrentIndex(itemIndex);
  }, [selectItem]);

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    if (thumbnailRef.current) {
      const list = thumbnailRef.current;

      const thumbnailItems = list.children;
      const htmlElement = thumbnailItems[startIndex] as HTMLElement;
      if (htmlElement && view === "Horizontal") {
        timeOut = setTimeout(() => {
          list.scroll({
            behavior: "smooth",
            left: htmlElement.offsetLeft,
          });
        }, 100);
      } else if (htmlElement && view === "Vertical") {
        timeOut = setTimeout(() => {
          list.scroll({
            behavior: "smooth",
            top: htmlElement.offsetTop - list.offsetHeight / 2,
          });
        }, 100);
      }
    }

    return () => {
      clearTimeout(timeOut);
    };
  }, [startIndex, thumbnailRef, view]);

  const handleNextImage = () => {
    console.log("next");
    if (currentIndex < items.length - 1) {
      const newIndex = currentIndex + 1;
      dispatch(setActiveItem(items[newIndex]));
      scrollThumbnail(newIndex);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePreviousImage = (item: any) => {
    console.log("Previous");

    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      dispatch(setActiveItem(items[newIndex]));
      scrollThumbnail(newIndex);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleExitFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      dispatch(setActiveItem(""));
      dispatch(clearMultiSelectItems());
    } else {
      dispatch(setActiveItem(""));

      setIsFullScreen(false);
    }
  };

  const scrollThumbnail = (index: number) => {
    const list = thumbnailRef.current;
    const thumbnailItem = list?.children;
    if (thumbnailItem) {
      thumbnailItem[index].scrollIntoView({ behavior: "smooth" });
    }
  };

  const _handleViewChange = () => {
    if (view === "Horizontal") {
      setView("Vertical");
    } else {
      setView("Horizontal");
    }
  };

  const _handleSubmitImage = () => {
    setIsSubmit(true);
  };

  const checkIsSelect = useCallback(
    (item) => {
      const isSelect = multiSelectItems.findIndex(
        (selectedItem) => selectedItem.name === item.name
      );
      if (isSelect > -1) return true;
      return false;
    },
    [multiSelectItems]
  );

  const _handleScrollToActive = () => {
    if (thumbnailRef.current) {
      const list = thumbnailRef.current;

      const thumbnailItems = list.children;
      const htmlElement = thumbnailItems[currentIndex] as HTMLElement;
      if (htmlElement && view === "Horizontal") {
        list.scroll({
          behavior: "smooth",
          left: htmlElement.offsetLeft,
        });
      } else if (htmlElement && view === "Vertical") {
        list.scroll({
          behavior: "smooth",
          top: htmlElement.offsetTop - list.offsetHeight / 2,
        });
      }
    }
  };

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

  const _handleSliderOnMouseUp = async () => {
    setIsLoading(true);
    await handleModeChange(selectItem.name, sliderValue);
    setIsLoading(false);
  };

  return (
    <>
      {!isLoading && (
        <div
          className={
            view === "Horizontal"
              ? styles.container
              : `${styles.container} ${styles.containerVertical}`
          }
        >
          <div className={styles.options}>
            <div className={styles.nameImage}>{selectItem.name}</div>

            {view === "Vertical" && (
              <button
                data-tooltip="Change view"
                onClick={() => {
                  _handleViewChange();
                }}
                disabled={multiSelectItems.length !== 1}
                className={
                  multiSelectItems.length !== 1
                    ? `${styles.viewBtn} ${styles.disabled}`
                    : styles.viewBtn
                }
              >
                <MdOutlineViewSidebar />
              </button>
            )}

            {view === "Horizontal" && (
              <button
                data-tooltip="Change view"
                onClick={() => {
                  _handleViewChange();
                }}
                disabled={multiSelectItems.length !== 1}
                className={
                  multiSelectItems.length !== 1
                    ? `${styles.viewBtn} ${styles.disabled}`
                    : styles.viewBtn
                }
              >
                <MdOutlineViewModule />
              </button>
            )}

            <button
              data-tooltip="Scroll to active"
              onClick={() => {
                _handleScrollToActive();
              }}
              // disabled={multiSelectItems.length !== 1}
              className={
                // multiSelectItems.length !== 1
                //   ? `${styles.viewBtn} ${styles.disabled}`
                //   : styles.viewBtn

                styles.viewBtn
              }
            >
              <BsArrowsCollapse />
            </button>

            {/* <button
          data-tooltip="Change mode"
          onClick={() => {
            dispatch(clearMultiSelectItems());

            handleModeChange(selectItem.name);
          }}
          disabled={multiSelectItems.length !== 1}
          className={
            multiSelectItems.length !== 1
              ? `${styles.viewBtn} ${styles.disabled}`
              : styles.viewBtn
          }
        >
          {mode === 1 ? <FaSearchMinus /> : <FaSearchPlus />}
        </button> */}

            <button
              data-tooltip="Search by image"
              disabled={multiSelectItems.length !== 1}
              className={
                multiSelectItems.length !== 1
                  ? `${styles.viewBtn} ${styles.disabled}`
                  : `${styles.viewBtn}`
              }
              onClick={() => {
                searchByImage();
              }}
            >
              <BiSearch />
            </button>
            {/* <button onClick={() => { _handleSubmitImage(items[currentIndex]) }} disabled={!items[currentIndex]} className={!items[currentIndex] ? `${styles.sendBtn} ${styles.sendBtnDisable}` : `${styles.sendBtn}`}>Submit Image</button> */}
            <button
              data-tooltip="Submit image"
              className={
                !items[currentIndex]
                  ? `${styles.sendBtn} ${styles.sendBtnDisable}`
                  : `${styles.sendBtn}`
              }
              onClick={() => _handleSubmitImage()}
            >
              <FiSend />
            </button>

            <div className={styles.sliderContainer}>
              <input
                type="range"
                id="quantity"
                min={0}
                max={0.5}
                step={0.01}
                onInput={(e: any) => setSliderValue(e.target.value)}
                onMouseUp={() => _handleSliderOnMouseUp()}
                value={sliderValue}
              />
              <span>{sliderValue}</span>
            </div>
          </div>

          <div
            className={`${styles.direction} ${styles.directionLeft}`}
            onClick={handlePreviousImage}
          >
            <GrFormPrevious className={styles.icon} size="4em" />
          </div>

          <div className={styles.originalImage}>
            <img src={selectItem.path} alt="" />
          </div>

          <div
            className={`${styles.direction} ${styles.directionRight}`}
            onClick={handleNextImage}
          >
            <GrFormNext className={styles.icon} size="4em" />
          </div>

          <div
            onClick={handleExitFullScreen}
            className={styles.exitFullScreenIcon}
          >
            <BsFullscreenExit size="2em" />
          </div>

          {/* <div className={styles.slideShowContainer}> */}

          <ul className={styles.thumnailContainer} ref={thumbnailRef}>
            {items.map((item, index) => (
              <li
                key={index}
                onClick={() => _handleThumbnailClick(index, item)}
                className={checkIsSelect(item) ? styles.active : ""}
              >
                <img src={item.path} alt="" loading={"lazy"} />
              </li>
            ))}
          </ul>
          {/* </div> */}

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
        </div>
      )}

      {isLoading && (
        <div className={styles.loadingWrapper}>
          <Loader loading={isLoading} size={100} color="#0071FF" />
        </div>
      )}
    </>
  );
};

export default ImageSlideShow;

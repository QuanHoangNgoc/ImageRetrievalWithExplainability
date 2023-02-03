import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ResultPaginate.module.scss";
import { ResultItem } from "../index";
import { GoTriangleLeft, GoTriangleRight } from "react-icons/go";
import Loader from "react-spinners/ClipLoader";
import { ResultPaginateProps } from "../../share/types";
import axios from "axios";
import Pagination from "react-js-pagination";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import ImageSlideShow from "../ImageSlideShow/ImageSlideShow";
import "react-image-gallery/styles/css/image-gallery.css";
import {
  urlGenerator,
  sliceNeedData,
  urlDetailGenerator,
  defaultDetail,
} from "../../libs/library";

import ColSlider from "../ColSilder/ColSlider";
import { v4 } from "uuid";
import ImageHandle from "../ImageHandle/ImageHandle";
import {
  addReadItem,
  addSelectItems,
  clearMultiSelectItems,
  setActiveItem,
  setColNum,
  setIsFocusInput,
} from "../../redux/reducers/searchSlice";

const ResultPaginate: React.FC<ResultPaginateProps> = ({ folderHandle }) => {
  const galleryWrapperRef = useRef<HTMLDivElement>(null);
  // Redux state
  const {
    items,
    totalResult,
    itemsPerPage,
    searchType,
    readItems,
    isFocusInput,
    colNum,
    stateId,
    activeItem,
  } = useSelector((state: RootState) => state.searchManager);

  const dispatch = useDispatch();

  // Component state
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  const [needDataDisplay, setNeedDataDisplay] = useState([]);
  const pageCount =
    totalResult > itemsPerPage ? Math.ceil(totalResult / itemsPerPage) : 1;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [videoItems, setVideoItems] = useState<any[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [startIndex, setStartIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState(1);

  const galleryRef = useRef<any>(null);

  const fetchGallery = async (name: string) => {
    setIsLoading(true);
    const res = await axios.get(
      `${process.env.REACT_APP_BACK_END_URL}/api/lsc/summary`,
      {
        params: {
          shot_name: name,
          state_id: stateId,
          detail: defaultDetail,
        },
      }
    );
    const data = res.data.reply;
    const imageUrl = await urlGenerator(folderHandle, data);
    if (!imageUrl) return;
    let minIndex = 0;
    let min = null;
    const currentSecondString = +activeItem.name.split("_")[1];
    imageUrl.forEach((item: any, index) => {
      const secondString = +item.name.split("_")[1];
      const minusValue = Math.abs(secondString - currentSecondString);

      if (min === null) {
        min = minusValue;
        minIndex = index;
      } else {
        if (minusValue < min) {
          min = minusValue;
          minIndex = index;
        }
      }
    });

    console.log(minIndex);

    setVideoItems(imageUrl);
    dispatch(setActiveItem(imageUrl[minIndex]));
    dispatch(addSelectItems(imageUrl[minIndex]));
    setStartIndex(minIndex);
    setIsLoading(false);
  };

  const _handleModeChange = async (name: string, floatValue: number = 1) => {
    dispatch(clearMultiSelectItems());
    let res = null;
    // if (mode === 1)
    res = await axios.get(
      `${process.env.REACT_APP_BACK_END_URL}/api/lsc/summary`,
      {
        params: {
          shot_name: name,
          state_id: stateId,
          detail: floatValue,
        },
      }
    );
    // // else {
    // res = await axios.get(
    //   `${process.env.REACT_APP_BACK_END_URL}/api/lsc/video`,
    //   {
    //     params: {
    //       shot_name: name,
    //       state_id: stateId,
    //       detail: floatValue,
    //     },
    //   }
    // );
    // // }
    console.log(res);
    const data = res.data.reply;
    const imageUrl = await urlGenerator(folderHandle, data);
    if (!imageUrl) return;
    let minIndex = 0;
    let min = null;
    const currentSecondString = +activeItem.name.split("_")[1];
    imageUrl.forEach((item: any, index) => {
      const secondString = +item.name.split("_")[1];
      const minusValue = Math.abs(secondString - currentSecondString);

      if (min === null) {
        min = minusValue;
        minIndex = index;
      } else {
        if (minusValue < min) {
          min = minusValue;
          minIndex = index;
        }
      }
    });

    console.log(minIndex);

    setVideoItems(imageUrl);
    dispatch(setActiveItem(imageUrl[minIndex]));
    dispatch(addSelectItems(imageUrl[minIndex]));
    setStartIndex(minIndex);
  };

  useEffect(() => {
    if (items.length === 0) return;
    const startIndex = itemsPerPage * currentPage - itemsPerPage;
    const endIndex = itemsPerPage * currentPage;
    const needData = sliceNeedData(items, startIndex, endIndex);
    setNeedDataDisplay(needData);
  }, [itemsPerPage, currentPage, items]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  useEffect(() => {
    const startIndex = itemsPerPage * currentPage - itemsPerPage;

    const generateUrlHandle = async () => {
      setIsLoading(true);
      const displayImageUrls = await Promise.all(
        needDataDisplay.map(async (imageDetail, index) => {
          if (readItems[startIndex + index]) {
            // console.log(readItems[startIndex + index])
            // console.log("Co data")
            return readItems[startIndex + index];
          } else {
            // console.log("Chua co data")
            const imageUrl = await urlDetailGenerator(
              folderHandle,
              imageDetail
            );
            dispatch(
              addReadItem({
                getUrls: imageUrl,
                index: startIndex + index,
              })
            );
            // console.log(imageUrl)
            return imageUrl;
          }
        })
      );
      setIsLoading(false);
      // console.log(displayImageUrls)
      setCurrentItems(displayImageUrls);
      // console.log(currentItems)
    };

    generateUrlHandle();
  }, [needDataDisplay]);

  useEffect(() => {
    const lastPage = Math.floor(readItems.length / itemsPerPage);
    if (lastPage > currentPage) return;

    if (readItems.length > 2048 || readItems.length === 0) return;
    // console.log(readItems.length)
    const dataPageNext = sliceNeedData(
      items,
      readItems.length,
      readItems.length + itemsPerPage
    );
    dataPageNext.map(async (imageDetail, index) => {
      while (isLoading) {}

      if (readItems[readItems.length + index]) {
        // console.log(readItems[startIndex + index])
      } else {
        const imageUrl = await urlDetailGenerator(folderHandle, imageDetail);
        dispatch(
          addReadItem({
            getUrls: imageUrl,
            index: readItems.length + index,
          })
        );
      }
    });
  }, [currentItems]);

  const handlePageClick = async (page: number) => {
    if (page < 1 || page > pageCount) return;

    const clickPage = page;
    if (clickPage === currentPage) return;

    setCurrentPage(page);
    // setIsFocusInput()

    if (galleryWrapperRef.current) {
      galleryWrapperRef.current.scroll({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  function _handleExitFullScreen() {
    if (!document.fullscreenElement) {
      setIsFullScreen(false);
      // dispatch(setActiveItem(""));
    }
  }

  async function _handleFullScreenImage(name: string) {
    await fetchGallery(name);
    setIsFullScreen(true);
  }

  // Add fullscreen event
  useEffect(() => {
    document.addEventListener("fullscreenchange", _handleExitFullScreen);

    return () => {
      document.removeEventListener("fullscreenchange", _handleExitFullScreen);
    };
  }, []);

  useEffect(() => {
    if (isFullScreen) {
      galleryRef.current.requestFullscreen();
    }
  }, [isFullScreen]);

  const _handleSliderOnChange = (value: any) => {
    dispatch(setColNum(value));
  };

  const handleKeyUp = useCallback(
    (e) => {
      // console.log(isFocusInput);
      if (isFocusInput) return;

      const key = e.keyCode;
      if (key === 37) {
        handlePageClick(currentPage - 1);
        return;
      }

      if (key === 39) {
        handlePageClick(currentPage + 1);
        return;
      }
    },
    [isFocusInput, currentPage]
  );

  const handleKeyDown = useCallback(
    (e) => {
      // console.log(isFocusInput);
      if (isFocusInput) return;

      const key = e.keyCode;
      if (key === 40) {
        if (galleryWrapperRef.current) {
          galleryWrapperRef.current.scroll({
            behavior: "smooth",
            top: galleryWrapperRef.current.scrollTop + 30,
          });
        }
        return;
      }

      if (key === 38) {
        if (galleryWrapperRef.current) {
          galleryWrapperRef.current.scroll({
            behavior: "smooth",
            top: galleryWrapperRef.current.scrollTop - 30,
          });
        }
        return;
      }
    },
    [isFocusInput, currentPage]
  );

  useEffect(() => {
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyUp, handleKeyDown]);

  return (
    <>
      {currentItems.length > 0 && (
        <div className={styles.resultWrapper}>
          {isLoading && (
            <div className={styles.loadingWrapper}>
              <Loader loading={isLoading} size={100} color="#0071FF" />
            </div>
          )}

          {!isLoading && !isFullScreen && (
            <>
              <div className={styles.listOptions}>
                <ColSlider
                  defaultValue={colNum}
                  handleOnChange={_handleSliderOnChange}
                />
                <ImageHandle
                  handleFullScreenImage={_handleFullScreenImage}
                  folderHandle={folderHandle}
                />
              </div>

              <div
                className={styles.galleryWrapper}
                style={{ gridTemplateColumns: `repeat(${colNum},1fr)` }}
                ref={galleryWrapperRef}
              >
                {currentItems.map((item, index) => (
                  <ResultItem item={item} key={index} />
                ))}
              </div>
            </>
          )}

          {!isLoading && isFullScreen && startIndex !== -1 && (
            <div ref={galleryRef}>
              <ImageSlideShow
                items={videoItems}
                startIndex={startIndex}
                // handleItemClick={_handleItemClick}
                setIsFullScreen={setIsFullScreen}
                handleModeChange={_handleModeChange}
                mode={mode}
              />
            </div>
          )}

          <div className={styles.paginationWrapper}>
            <p className={styles.totalItem}>{totalResult} results</p>

            <Pagination
              activePage={currentPage}
              itemsCountPerPage={itemsPerPage}
              totalItemsCount={totalResult}
              pageRangeDisplayed={5}
              onChange={handlePageClick}
              innerClass={styles.paginate}
              activeClass={styles.active}
              hideFirstLastPages={true}
              prevPageText={<GoTriangleLeft size={20} />}
              nextPageText={<GoTriangleRight size={20} />}
              disabledClass={styles.disabled}
            />

            {/* Số trang qua bên phải */}
            <p className={styles.totalPage}>{pageCount} pages</p>
          </div>
        </div>
      )}

      {!isLoading && totalResult === 0 && (
        <div className={styles.noFoundWrapper}>
          <h1>NO SEARCH FOUND</h1>
        </div>
      )}
    </>
  );
};

export default ResultPaginate;

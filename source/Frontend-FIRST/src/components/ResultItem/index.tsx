import { ResultItemProps } from "../../share/types";

import styles from "./ResultItem.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  addSelectItems,
  clearMultiSelectItems,
  setActiveItem,
  setSelectItems,
} from "../../redux/reducers/searchSlice";
import { RootState } from "../../redux/store";
import { useEffect, useState } from "react";
import { click } from "@testing-library/user-event/dist/click";

const ResultItem: React.FC<ResultItemProps> = ({ item }) => {
  const dispatch = useDispatch();
  const {
    activeItem,
    ctrlIsPressed,
    multiSelectItems,
    shiftIsPressed,
    readItems: items,
  } = useSelector((state: RootState) => state.searchManager);
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const haveItem = multiSelectItems.findIndex((selectItem) => {
      if (selectItem?.name) return selectItem.name === item.name;
      else return selectItem === item.name;
    });

    if (haveItem > -1) setIsSelected(true);
    else setIsSelected(false);
  }, [multiSelectItems]);

  const _handleItemClick = (item: any) => {
    //Neu nut ctrl duocj bam
    if (ctrlIsPressed) {
      //Neu da co active item
      if (activeItem) {
        //Xet neu item duoc bam da duoc select truoc do hay chua
        const alreadySelected = multiSelectItems.findIndex(
          (selectItem) => selectItem.name === item.name
        );

        //Neu duoc select trc roi thi xoa di

        console.log(alreadySelected);
        if (alreadySelected > -1) {
          const newSelectItems = [...multiSelectItems];
          console.log(newSelectItems);
          newSelectItems.splice(alreadySelected, 1);
          console.log(newSelectItems);
          dispatch(setSelectItems(newSelectItems));
          if (item.name === activeItem.name)
            dispatch(setActiveItem(newSelectItems[0]));

          //  Neu chua select thi select
        } else {
          dispatch(addSelectItems(item));
          dispatch(setActiveItem(item));
        }

        // Neu chua co active item
      } else {
        dispatch(clearMultiSelectItems());
        dispatch(addSelectItems(item));
        dispatch(setActiveItem(item));
      }
      return;
    }

    // Neu nut shift duoc bam
    if (shiftIsPressed) {
      if (activeItem) {
        const activeIndex = items.findIndex((listItem) => {
          return listItem.name === activeItem.name;
        });
        const clickIndex = items.findIndex(
          (listItem) => listItem.name === item.name
        );

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

  return (
    <div
      className={
        isSelected
          ? `${styles.itemWrapper} ${styles.itemWrapperActive}`
          : `${styles.itemWrapper}`
      }
      onClick={() => _handleItemClick(item)}
    >
      <img src={item.path} alt="" loading={"lazy"} />
    </div>
  );
};

export default ResultItem;

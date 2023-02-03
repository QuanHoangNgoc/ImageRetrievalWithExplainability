import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeItemPerPage } from "../../redux/reducers/searchSlice";
import { RootState } from "../../redux/store";
import { QuantityOptionProps } from "../../share/types";
import styles from "./QuantityOption.module.scss";

import { minQuantity, maxQuantity } from "../../libs/library";
const QuantityOption: React.FC<QuantityOptionProps> = () => {
  const dispatch = useDispatch();
  const initValue = useSelector(
    (state: RootState) => state.searchManager.itemsPerPage
  );

  const [inputValue, setInputValue] = useState(initValue.toString());

  function _handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    if (value.includes("`")) return;
    setInputValue(value);
  }

  useEffect(() => {
    if (inputValue === initValue.toString()) return;

    const debounce = setTimeout(() => {
      if (!inputValue || !Number.isInteger(+inputValue)) return;
      const value =
        +inputValue <= minQuantity
          ? 1
          : +inputValue > maxQuantity
          ? maxQuantity
          : +inputValue;
      dispatch(changeItemPerPage(value));
    }, 1000);

    return () => {
      clearTimeout(debounce);
    };
  }, [inputValue, dispatch, initValue]);

  useEffect(() => {
    setInputValue(initValue.toString());
  }, [initValue]);

  return (
    <div className={styles.quantityOption}>
      <label htmlFor="itemsPerPage">
        Images per page (Max: {maxQuantity}):
      </label>

      <input
        type="text"
        id="itemsPerPage"
        className={styles.quantityOption__input}
        onChange={_handleOnChange}
        value={inputValue}
      />
    </div>
  );
};

export default QuantityOption;

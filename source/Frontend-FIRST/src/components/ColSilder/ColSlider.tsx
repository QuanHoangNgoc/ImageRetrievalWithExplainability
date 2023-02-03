import React, { useRef, useState } from "react";
import { ColSliderProps } from "../../share/types";
import styles from "./ColSlider.module.scss";
import { maxCol, minCol } from "../../libs/library";
const ColSlider: React.FC<ColSliderProps> = ({
  defaultValue,
  handleOnChange,
}) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [openBubble, setOpenBubble] = useState<boolean>(false);

  const _handleOnChange = (e: any) => {
    const value = e.target.value;

    updateBubblePos(value);
    handleOnChange(value);
  };

  const updateBubblePos = (value: number) => {
    const newVal = ((value - minCol) * 100) / (maxCol - minCol);
    return `calc(${newVal}% + (${8 - newVal * 0.15}px))`; // Magic number
  };

  const _handleMouseDown = () => {
    setOpenBubble(true);
  };

  const _handleMouseUp = () => {
    setOpenBubble(false);
  };

  return (
    <div className={styles.colSliderContainner}>
      <input
        type="range"
        id="colRange"
        min={minCol}
        max={maxCol}
        value={defaultValue}
        className={styles.colSlider}
        onInput={(e) => _handleOnChange(e)}
        onPointerDown={_handleMouseDown}
        onPointerUp={_handleMouseUp}
      />
      {openBubble && (
        <output
          className={styles.bubble}
          ref={bubbleRef}
          style={{ left: updateBubblePos(defaultValue) }}
        >
          {defaultValue}
        </output>
      )}
    </div>
  );
};

export default ColSlider;

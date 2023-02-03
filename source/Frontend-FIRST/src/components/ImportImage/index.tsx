import React from "react";
import { ImportImageProps } from "../../share/types";
import { ListDirHandler } from "../../share/types";
import styles from "./ImportImage.module.scss";

const ImportImage: React.FC<ImportImageProps> = ({ setFolderHandle }) => {
  const handleClick = async () => {
    const dirHandle = await window.showDirectoryPicker();
    let initListBatchDirHandler: ListDirHandler = {};
    let keys = [];
    let count = 0;

    for await (const key of dirHandle.keys()) {
      keys.push(key);
    }

    for await (const entry of dirHandle.entries()) {
      if (entry[1].kind === "directory") {
        initListBatchDirHandler[keys[count]] = entry[1];
      }
      ++count;
    }

    console.log(initListBatchDirHandler);
    setFolderHandle(initListBatchDirHandler);
  };

  return (
    <button className={styles.importBtn} onClick={handleClick}>
      Select Folder
    </button>
  );
};

export default ImportImage;

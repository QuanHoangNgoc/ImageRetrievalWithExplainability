export interface ResultGalleryIntervalProps {}
export interface ListDirHandler {
  [fieldId: string]: FileSystemDirectoryHandle;
}
export interface ImportImageProps {
  setFolderHandle: any;
}

export interface PreviewImageProps {
  listBatchDirHandler: ListDirHandler;
  showImageName: any[];
}

export interface ResultItemProps {
  item: any;
  // searchType: string;
  handleItemClick?: any;
  index?: any;
}

// export interface SearchKeyProps {
//   content: string;
//   removeSearchKeyDispatch: (params: any) => void;
//   index: number; //Test remove function. We will use id instead if it real data
// }

export interface TextFieldProps {
  isSearch: Boolean;
  setIsSearch: any;
  folderHandle: ListDirHandler;
  // fetchDispatch: Function;
  // changeSearchTypeDispatch: Function;
  // searchType: string;
  // dispatchChangeView: Function;
  // viewType: string;
}

export interface ViewOptionProps {
  // dispatchChangeView: Function;
  // viewType: string;
}
export interface HomepageProps {}
export interface VideoPlayerProps {
  item: Array<any>;
}

export interface QuantityOptionProps {
  // dispatchChangeItemsPerPage: Function;
}
export interface ResultPaginateProps {
  folderHandle: ListDirHandler;
}
export interface ItemIntervalProps {
  intervalData: any;
  searchType: string;
  intervalRange: string;
  setCurrentYear: Function;
  setCurrentMonth: Function;
  setCurrentDay: Function;
  setCurrentHour: Function;
  setIntervalRange: Function;
}

export interface ColSliderProps {
  defaultValue: number;
  handleOnChange: (number: Number) => void;
}

export interface ImageSlideShowProps {
  items: any[];
  startIndex: number;
  setIsFullScreen?: any;
  handleModeChange: (name: string, floatValue?: number) => void;
  mode: number;
}

export interface ImageHandleProps {
  handleFullScreenImage: any;
  folderHandle: ListDirHandler;
}

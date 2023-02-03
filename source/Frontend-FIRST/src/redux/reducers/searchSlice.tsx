import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CounterState {
  items: any[];
  searchType: string;
  firstLoading: boolean;
  isSearch: boolean;
  searchTerm: string;
  viewType: string;
  itemsPerPage: number;
  totalResult: number;
  folderHandle: any;
  activeItem: any;
  readItems: any[];
  isFocusInput: boolean;
  colNum: number;
  sessionId: any;
  multiSelectItems: any[];
  ctrlIsPressed: boolean;
  shiftIsPressed: boolean;
  stateId: string;
  filter: string;
}

const initialState: CounterState = {
  items: [],
  searchType: "text",
  firstLoading: false,
  isSearch: false,
  searchTerm: "",
  totalResult: 0,
  viewType: "default",
  itemsPerPage: 12,
  folderHandle: "",
  activeItem: "",
  readItems: [],
  isFocusInput: false,
  colNum: 12,
  sessionId: "",
  multiSelectItems: [],
  ctrlIsPressed: false,
  shiftIsPressed: false,
  stateId: "",
  filter: "",
};

export const searchSlice = createSlice({
  name: "searcher",
  initialState,
  reducers: {
    replaceItems: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
    },

    addItem: (state, action: PayloadAction<[]>) => {
      state.items.push(...action.payload);
    },

    changeItemPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
    },

    changeSearchType: (state, action: PayloadAction<string>) => {
      state.searchType = action.payload;
    },

    changeView: (state, action: PayloadAction<string>) => {
      state.viewType = action.payload;
    },

    changeFirstLoading: (state, action: PayloadAction<boolean>) => {
      state.firstLoading = action.payload;
    },

    changeSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },

    changeTotalResult: (state, action: PayloadAction<number>) => {
      state.totalResult = action.payload;
    },

    changeIsSearch: (state, action: PayloadAction<boolean>) => {
      state.isSearch = action.payload;
    },

    setFolderHandle: (state, action: PayloadAction<any>) => {
      state.folderHandle = action.payload;
    },

    setActiveItem: (state, action: PayloadAction<any>) => {
      // state.multiSelectItems = [];
      // state.multiSelectItems.push(action.payload);
      state.activeItem = action.payload;
    },
    addReadItem: (state, action: PayloadAction<any>) => {
      // console.log(action.payload)
      state.readItems[action.payload.index] = action.payload.getUrls;
      // state.readItems.push(...action.payload);
    },
    clearReadItem: (state) => {
      state.readItems = [];
    },
    setIsFocusInput: (state, action) => {
      state.isFocusInput = action.payload;
    },
    setColNum: (state, action) => {
      state.colNum = action.payload;
    },

    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },

    clearMultiSelectItems: (state) => {
      state.multiSelectItems = [];
    },

    addSelectItems: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.multiSelectItems.push(...action.payload);
      } else state.multiSelectItems.push(action.payload);
    },
    setSelectItems: (state, action) => {
      state.multiSelectItems = action.payload;
    },

    setCtrlIsPressed: (state, action) => {
      state.ctrlIsPressed = action.payload;
    },

    setShiftIsPressed: (state, action) => {
      state.shiftIsPressed = action.payload;
    },

    setStateId: (state, action) => {
      state.stateId = action.payload;
    },

    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addItem,
  replaceItems,
  changeItemPerPage,
  changeSearchType,
  changeView,
  changeFirstLoading,
  changeTotalResult,
  changeIsSearch,
  changeSearchTerm,
  setFolderHandle,
  setActiveItem,
  addReadItem,
  clearReadItem,
  setIsFocusInput,
  setColNum,
  setSessionId,
  setCtrlIsPressed,
  addSelectItems,
  clearMultiSelectItems,
  setSelectItems,
  setShiftIsPressed,
  setStateId,
  setFilter,
} = searchSlice.actions;

export default searchSlice.reducer;

import React, { useEffect } from 'react';
import { Paper, TextField, Autocomplete } from '@mui/material';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { combineReducers, configureStore, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import logger from "redux-logger";

// https://catfact.ninja/breedsの戻り値の型
//  不要な項目は省略しました
type CatfactResponseType = {
  current_page: number,
  data: CatfactDataType[],
  last_page: number,
  per_page: number,
  total: number
};
type CatfactDataType = {
  breed: string,
  country?: string,
  origin?: string,
  coat?: string,
  pattern?: string
}

const sleep = (sec: number) => new Promise((resolve) => setTimeout(resolve, sec * 1000));

const AppMain = () => {
  const dispatch = useDispatch<AppDispatch>();
  const catBreeds = useSelector((state:RootState) =>  state.catBreeds.catBreeds);
  const lastValue = useSelector((state:RootState) =>  state.catBreeds.lastValue);

  useEffect(() => {
    dispatch(setLastValue({breed: "Bambino"}));
    dispatch(getCatBreeds());
  }, []);

  console.log("-- render");
  return (
    <Paper sx={{p: 10, m: 5}}>
    <Autocomplete
      disablePortal
      id="combo-box-demo"
      options={catBreeds}
      getOptionLabel={(option) => option.breed}
      value = {lastValue}
      // value = {catBreeds.length > 0 ? lastValue : null}
      isOptionEqualToValue={(option, value) => value === null || option.breed === value.breed}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="Cats" />}
    />
   </Paper>
  );
}

// --------------------------------------------------------

type CatBreedsReturnType = CatfactDataType[];
type CatBreedsArgType = void;

const getCatBreeds = createAsyncThunk<CatBreedsReturnType, CatBreedsArgType>(
  "catBreeds/getCatBreeds",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("https://catfact.ninja/breeds");
      const body: CatfactResponseType = await response.json();
      console.log(body);
      await sleep(2);
      return body.data;
    } catch (err) {
      console.log('** error **', err)
      return rejectWithValue(err);
    }
  }
)

// --------------------------------------------------------

type CatBreedsState = {
  catBreeds: CatfactDataType[],
  lastValue: CatfactDataType | null,
  loading: boolean
}

const catBreedsSlice = createSlice({
  name: "weather",
  initialState: {catBreeds: [], lastValue: null, loading: false} as CatBreedsState,
  reducers: {
    setLastValue: (state, action: PayloadAction<CatfactDataType>) => {
      state.lastValue = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getCatBreeds.pending, (state) => {
      state.catBreeds = [];
      state.loading = true;
    })
     builder.addCase(getCatBreeds.fulfilled, (state, action) => {
      state.catBreeds = action.payload;
      state.loading = false
    })
    builder.addCase(getCatBreeds.rejected, (state) => {
      state.catBreeds = [];
      state.loading = false;
    })
  }
});

const { setLastValue } = catBreedsSlice.actions;
const catBreedsReducer = catBreedsSlice.reducer;
export const rootReducer = combineReducers({
  catBreeds: catBreedsReducer
});
type RootState = ReturnType<typeof rootReducer>;
type AppDispatch = typeof store.dispatch;

// --------------------------------------------------------

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger)
});

const App = () => {
  return (
    <Provider store={store}>
      <AppMain />
    </Provider>
  )
};

export default App;

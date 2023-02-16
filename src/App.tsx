import React, { useEffect, useState } from 'react';
import { Paper, TextField, Autocomplete } from '@mui/material';

// https://catfact.ninja/breedsの戻り値の型
//  不要な項目は省略しました
type CatfactResponseType = {
  current_page: number,
  data: CatfactDateType[],
  last_page: number,
  per_page: number,
  total: number
};
type CatfactDateType = {
  breed: string,
  country?: string,
  origin?: string,
  coat?: string,
  pattern?: string
}

const sleep = (sec: number) => new Promise((resolve) => setTimeout(resolve, sec * 1000));

const getCatBreeds = async () => {
  const response = await fetch("https://catfact.ninja/breeds");
  const body: CatfactResponseType = await response.json();
  console.log(body);
  await sleep(2);
  return body.data;
}

const App = () => {
  const [catBreeds, setCatBreeds] = useState<CatfactDateType[]>([]);
  const [value, setValue] = useState<CatfactDateType|null>(null);

  useEffect(() => {
    setTimeout(() => setValue({breed: "xx"}), 0.5 * 1000);
    (async() => {
      setCatBreeds(await getCatBreeds());
    })();
  }, []);

  return (
    <Paper sx={{p: 10, m: 5}}>
    <Autocomplete
      disablePortal
      id="combo-box-demo"
      options={catBreeds}
      getOptionLabel={(option) => option.breed}
      sx={{ width: 300 }}
      value={catBreeds.length > 0 ? value : null}
      renderInput={(params) => <TextField {...params} label="Cats" />}
    />
   </Paper>
  );
}


export default App;

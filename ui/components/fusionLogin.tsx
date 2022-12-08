import { LockOpen } from '@mui/icons-material'
import { Box, Button, Paper, TextField, Typography, useTheme } from '@mui/material'
import axios, { AxiosResponse } from 'axios'
import _ from 'lodash'
import { useState } from 'react'

import { PodUserAccount } from '../lib/libsData'
import { AppUser } from '../pages'

type FusionLoginProps = {
  onLogin(user: AppUser): void;
  onError(message: string): void;
  startLoading(): void;
  stopLoading(): void;
};
const fusionLogin: React.FC<FusionLoginProps> = (
  props: FusionLoginProps
): JSX.Element => {
  const theme = useTheme();
  const [loginUserName, setLoginUserName] = useState<string>("");

  const searchForUser = () => {
    props.startLoading();
    props.onError("");

    if (_.isEmpty(loginUserName) || _.isNil(loginUserName)) {
      props.onError("Please enter a user account before searching");
      props.stopLoading();
      return;
    }
    if (!loginUserName.endsWith("_ex")) {
      props.onError(
        "You cannot search for a user account for a non-consultant user"
      );
      props.stopLoading();
      return;
    }
    axios
      .get(`api/users/${loginUserName}`)
      .then((response: AxiosResponse<PodUserAccount>) => {
        if (_.isNil(response.data.GUID))
          props.onError(
            `A user with the user name of ${loginUserName} was not found.`
          );
        else {
          let appUser: AppUser = { userName: "", userGuid: "", auth: false };
          appUser.userName = response.data.Username;
          appUser.userGuid = response.data.GUID;
          appUser.auth = true;
          props.onLogin(appUser);
        }
      })
      .catch((response: AxiosResponse<any>) =>
        props.onError(
          `The request to ${response.config.url} failed with a error of ${response.data}`
        )
      )
      .finally(() => props.stopLoading());
  };

  return (
    <Paper
      sx={{
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        background: theme.palette.grey[800],
        color: theme.palette.common.black,
        p: "30px",
        mt: "30px",
        maxWidth: "450px",
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          alignContent: "center",
        }}
      >
        <LockOpen
          sx={{ color: theme.palette.common.white, fontSize: "40px" }}
        ></LockOpen>
        <Typography
          variant="h5"
          sx={{ color: theme.palette.common.white, ml: 1 }}
        >
          FUSION user switcher
        </Typography>
      </Box>
      <Box sx={{ mb: 6 }}>
        <TextField
          variant="standard"
          value={loginUserName}
          onChange={(e) => setLoginUserName(e.currentTarget.value)}
          label="enter your fusion user name"
          fullWidth
        ></TextField>
      </Box>
      <Box sx={{ textAlign: "right" }}>
        <Button
          startIcon={<LockOpen />}
          variant="contained"
          fullWidth
          onClick={() => searchForUser()}
        >
          Login
        </Button>
      </Box>
    </Paper>
  );
};
export default fusionLogin;

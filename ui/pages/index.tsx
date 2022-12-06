import { LockOpen, Logout } from "@mui/icons-material";
import Person from "@mui/icons-material/Person";
import Person2 from "@mui/icons-material/Person2";
import Search from "@mui/icons-material/Search";
import {
  Alert,
  Autocomplete,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import axios, { AxiosResponse } from "axios";
import _ from "lodash";
import React, { ChangeEvent, useEffect, useState } from "react";

import { UserAccount, Worker } from "../lib/libsData";

export type AppUser = {
  userName: string;
  userGuid: string;
  auth: boolean;
};

export default function Home() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selWorker, setSelWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchUser, setSearchUser] = useState<string>();
  const [selUser, setSelUser] = useState<UserAccount | null>(null);
  const [userNotFoundMsg, setUserNotFoundMsg] = useState<string>("");
  const [loginUserName, setLoginUserName] = useState<string>("");
  const [appUser, setAppUser] = useState<AppUser>({
    userName: "",
    userGuid: "",
    auth: false,
  });
  const [tiedUser, setTiedUser] = useState<UserAccount | null>(null);

  const getWorkers = () => {
    axios
      .get("api/workers")
      .then((response: AxiosResponse<Worker[]>) => {
        setWorkers(response.data);
      })
      .catch((response: AxiosResponse<any>) => console.log(response))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getWorkers();
  }, []);

  const searchForUser = (isLogin: boolean = false) => {
    setLoading(true);
    setUserNotFoundMsg("");
    let userNameSearch: string | undefined = searchUser;
    if (isLogin) userNameSearch = loginUserName;
    if (_.isEmpty(userNameSearch) || _.isNil(userNameSearch)) {
      setUserNotFoundMsg("Please enter a user account before searching");
      setLoading(false);
      return;
    }
    if (!userNameSearch.endsWith("_ex")) {
      setUserNotFoundMsg(
        "You cannot search for a user account for a non-consultant user"
      );
      setLoading(false);
      return;
    }
    axios
      .get(`api/users/${userNameSearch}`)
      .then((response: AxiosResponse<UserAccount>) => {
        if (_.isNil(response.data.GUID))
          setUserNotFoundMsg(
            `A user with the user name of ${userNameSearch} was not found.`
          );
        else if (isLogin) {
          let appUser: AppUser = { userName: "", userGuid: "", auth: false };
          appUser.userName = response.data.Username;
          appUser.userGuid = response.data.GUID;
          appUser.auth = true;
          setAppUser(appUser);
          setSelUser(response.data);
          setSearchUser(response.data.Username);
        } else setSelUser(response.data);
      })
      .catch((response: AxiosResponse<any>) => console.log(response))
      .finally(() => setLoading(false));
  };

  const tieUserAndEmp = async (): Promise<void> => {
    try {
      setTiedUser(null);
      setUserNotFoundMsg("");
      setLoading(true);
      const response = await axios.post("api/users", {
        userGuid: selUser?.GUID,
        workerPersId: selWorker?.PersonId,
      });
      setTiedUser(response.data);
    } catch (e) {
      setUserNotFoundMsg(JSON.stringify(e));
    } finally {
      getWorkers();
      searchForUser(false);
    }
  };

  const login = (): void => {
    searchForUser(true);
  };

  const theme = useTheme();

  return (
    <>
      <Backdrop open={loading} sx={{ zIndex: 99999999999 }}>
        <CircularProgress
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </Backdrop>
      {appUser.auth && (
        <Box sx={{ textAlign: "right", mb: 4 }}>
          <Typography variant="caption">
            Logged In: {appUser.userName}
          </Typography>
          <IconButton
            sx={{ ml: 2 }}
            onClick={() =>
              setAppUser({ auth: false, userName: "", userGuid: "" })
            }
          >
            <Logout></Logout>
          </IconButton>
        </Box>
      )}
      {appUser.auth && (
        <Grid container spacing={4}>
          {tiedUser && (
            <Grid item xs={12}>
              <Alert
                severity="success"
                onClose={() => setTiedUser(null)}
                sx={{ width: "100%" }}
              >
                <Typography variant="h6">
                  Updated {tiedUser.Username}
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption">
                    Congratulations! You updated the user account:{" "}
                    <strong>{selUser?.Username}</strong> to be the employee:{" "}
                    {selWorker?.names[0].DisplayName} -{" "}
                    {selWorker?.PersonNumber}.
                  </Typography>
                </Box>
                <Typography variant="caption" component="small">
                  <strong>
                    NOTE: If you want to switch back, just select the employee{" "}
                    from the drop down list and tie back to that user account.
                  </strong>
                </Typography>
              </Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              disabled
              sx={{ width: "100%" }}
              variant="standard"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchUser(e.currentTarget.value)
              }
              value={searchUser}
              label="Enter a user account"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => searchForUser(false)}>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={workers}
              isOptionEqualToValue={(option: Worker, value: Worker) =>
                option.PersonId === value.PersonId
              }
              sx={{ width: "100%" }}
              getOptionLabel={(option: Worker) => {
                return `${option.names[0].DisplayName} - ${option.PersonNumber}`;
              }}
              onChange={(event: any, newValue: Worker | null) => {
                setSelWorker(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select an Employee" />
              )}
            />
          </Grid>
          {selUser && (
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
                Selected User: {selUser?.Username}
              </Typography>
              <Grid
                container
                spacing={0}
                sx={{
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                <Grid item xs={3} sx={{ textAlign: "center" }}>
                  <Person sx={{ fontSize: 150 }} />
                </Grid>
                <Grid item xs={8}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>Person Number:</TableCell>
                          <TableCell>{selUser?.PersonNumber}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>User Name:</TableCell>
                          <TableCell>{selUser?.Username}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>User ID:</TableCell>
                          <TableCell>{selUser?.UserId}</TableCell>
                        </TableRow>
                        <TableRow sx={{ border: 0 }}>
                          <TableCell>User GUID:</TableCell>
                          <TableCell>{selUser?.GUID}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Grid>
          )}
          {selWorker && (
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ textAlign: "center" }}>
                Selected Worker: {selWorker.names[0].DisplayName}
              </Typography>
              <Grid
                container
                spacing={0}
                sx={{
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                <Grid item xs={3} sx={{ textAlign: "center" }}>
                  <Person2
                    sx={{ fontSize: 150, color: theme.palette.common.black }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>Person Number:</TableCell>
                          <TableCell>{selWorker.PersonNumber}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Person Id:</TableCell>
                          <TableCell>{selWorker.PersonId}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Grid>
          )}
          {selUser && selWorker && (
            <Grid item xs={12} sx={{ textAlign: "right" }}>
              <Button onClick={() => tieUserAndEmp()}>
                Tie Worker and User
              </Button>
            </Grid>
          )}
        </Grid>
      )}
      {!appUser.auth && (
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
              onClick={() => searchForUser(true)}
            >
              Login
            </Button>
          </Box>
        </Paper>
      )}

      <Snackbar
        open={userNotFoundMsg != ""}
        autoHideDuration={6000}
        onClick={(event: React.SyntheticEvent | Event, reason?: string) => {
          if (reason === "clickaway") return;
          setUserNotFoundMsg("");
        }}
      >
        <Alert
          onClose={() => setUserNotFoundMsg("")}
          severity="error"
          sx={{ width: "100%" }}
        >
          {userNotFoundMsg}
        </Alert>
      </Snackbar>
    </>
  );
}

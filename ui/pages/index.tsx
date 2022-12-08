import Person from '@mui/icons-material/Person'
import Person2 from '@mui/icons-material/Person2'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
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
} from '@mui/material'
import { color } from '@mui/system'
import axios, { AxiosResponse } from 'axios'
import _ from 'lodash'
import React, { ChangeEvent, useEffect, useState } from 'react'

import FusionLogin from '../components/fusionLogin'
import Loader from '../components/loading'
import LoggedInUser from '../components/loggedInUser'
import UpdateUserNotif from '../components/updateUserNotif'
import { PodUserAccount, PodWorker } from '../lib/libsData'

export type AppUser = {
  userName: string;
  userGuid: string;
  auth: boolean;
};

export default function Home() {
  const [workers, setWorkers] = useState<PodWorker[]>([]);
  const [workerContext, setWorkerContext] = useState<PodWorker | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userContext, setUserContext] = useState<PodUserAccount | null>(null);
  const [userNotFoundMsg, setUserNotFoundMsg] = useState<string>("");
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [tiedUser, setTiedUser] = useState<PodUserAccount | null>(null);

  const getWorkers = () => {
    axios
      .get("api/workers")
      .then((response: AxiosResponse<PodWorker[]>) => {
        setWorkers(response.data);
      })
      .catch((response: AxiosResponse<any>) => console.log(response))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getWorkers();
  }, []);

  const searchForUser = (userName: string) => {
    setLoading(true);
    setUserNotFoundMsg("");
    if (_.isEmpty(userName) || _.isNil(userName)) {
      setUserNotFoundMsg("Please enter a user account before searching");
      setLoading(false);
      return;
    }
    if (!userName.endsWith("_ex")) {
      setUserNotFoundMsg(
        "You cannot search for a user account for a non-consultant user"
      );
      setLoading(false);
      return;
    }
    axios
      .get(`api/users/${userName}`)
      .then((response: AxiosResponse<PodUserAccount>) => {
        if (_.isNil(response.data.GUID))
          setUserNotFoundMsg(
            `A user with the user name of ${userName} was not found.`
          );
        else setUserContext(response.data);
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
        userGuid: userContext?.GUID,
        workerPersId: workerContext?.PersonId,
      });
      setTiedUser(response.data);
    } catch (e) {
      setUserNotFoundMsg(JSON.stringify(e));
    } finally {
      getWorkers();
      if (appUser && appUser.userName) searchForUser(appUser.userName);
      // comment
    }
  };

  const theme = useTheme();

  return (
    <>
      <Loader isLoading={loading} />
      {appUser && appUser.auth && (
        <>
          <Box
            sx={{
              display: "flex",
              alignContent: "flex-end",
              justifyContent: "right",
            }}
          >
            <LoggedInUser
              userName={appUser.userName}
              logout={() => setAppUser(null)}
            ></LoggedInUser>
          </Box>

          <Grid container spacing={4}>
            {tiedUser && (
              <UpdateUserNotif
                message=""
                notifEmp={workerContext!}
                notifUser={userContext!}
                onClose={() => setTiedUser(null)}
              ></UpdateUserNotif>
            )}
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                borderRight: { md: "solid 2px #666666" },
                pr: { md: 4 },
                pb: { md: 6 },
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 4, textTransform: "uppercase" }}
              >
                Employee Selector
              </Typography>
              <Box sx={{ mb: 4 }}>
                <TextField
                  disabled
                  sx={{ width: "100%" }}
                  variant="outlined"
                  value={appUser.userName}
                  label="Your User Name"
                />
              </Box>
              <Box>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={workers}
                  isOptionEqualToValue={(option: PodWorker, value: PodWorker) =>
                    option.PersonId === value.PersonId
                  }
                  sx={{ width: "100%" }}
                  getOptionLabel={(option: PodWorker) => {
                    return `${option.names[0].DisplayName} - ${option.PersonNumber}`;
                  }}
                  onChange={(event: any, newValue: PodWorker | null) => {
                    setWorkerContext(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select an Employee" />
                  )}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              {userContext && (
                <>
                  <Typography
                    variant="h6"
                    sx={{ mb: 4, mt: { sm: 4 }, textTransform: "uppercase" }}
                  >
                    Selected Employee and User
                  </Typography>
                  <Box>
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
                          <Table sx={{ width: 1 }}>
                            <TableBody>
                              <TableRow>
                                <TableCell>Person Number:</TableCell>
                                <TableCell>
                                  {userContext?.PersonNumber}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>User Name:</TableCell>
                                <TableCell>{userContext?.Username}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>User ID:</TableCell>
                                <TableCell>{userContext?.UserId}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
              {workerContext && (
                <Box sx={{ mt: { sm: 4 } }}>
                  <Grid
                    container
                    spacing={0}
                    sx={{
                      alignContent: "center",
                      alignItems: "top",
                    }}
                  >
                    <Grid item xs={3} sx={{ textAlign: "center" }}>
                      <Person2
                        sx={{
                          fontSize: 150,
                          color: theme.palette.grey[500],
                        }}
                      />
                    </Grid>
                    <Grid item xs={8}>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell>Person Number:</TableCell>
                              <TableCell>
                                {workerContext.PersonNumber}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Person Id:</TableCell>
                              <TableCell>{workerContext.PersonId}</TableCell>
                            </TableRow>
                            {userContext && workerContext && (
                              <TableRow>
                                <TableCell
                                  colSpan={2}
                                  align="right"
                                  sx={{ border: 0 }}
                                ></TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {userContext && workerContext && (
                        <TableContainer component={Box}>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell
                                  sx={{
                                    textAlign: "right",
                                    border: "none",
                                    pr: 0,
                                  }}
                                >
                                  <Button
                                    variant="contained"
                                    onClick={() => tieUserAndEmp()}
                                  >
                                    Tie Worker and User
                                  </Button>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Grid>
          </Grid>
        </>
      )}
      {!appUser && (
        <FusionLogin
          onError={(msg) => setUserNotFoundMsg(msg)}
          onLogin={(user) => {
            setAppUser(user);
            searchForUser(user.userName);
          }}
          startLoading={() => setLoading(true)}
          stopLoading={() => setLoading(false)}
        ></FusionLogin>
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

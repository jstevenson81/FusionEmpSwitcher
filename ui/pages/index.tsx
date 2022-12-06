import Person from '@mui/icons-material/Person'
import Person2 from '@mui/icons-material/Person2'
import Search from '@mui/icons-material/Search'
import {
  Alert,
  Autocomplete,
  Backdrop,
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
} from '@mui/material'
import axios, { AxiosResponse } from 'axios'
import _ from 'lodash'
import React, { ChangeEvent, useEffect, useState } from 'react'

import { UserAccount, Worker } from '../lib/libsData'

export default function Home() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selWorker, setSelWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchUser, setSearchUser] = useState<string>("stevenjw_ex");
  const [selUser, setSelUser] = useState<UserAccount | null>(null);
  const [userNotFoundMsg, setUserNotFoundMsg] = useState<string>("");

  useEffect(() => {
    axios
      .get("api/workers")
      .then((response: AxiosResponse<Worker[]>) => {
        setWorkers(response.data);
      })
      .catch((response: AxiosResponse<any>) => console.log(response))
      .finally(() => setLoading(false));
  }, []);

  const searchForUser = () => {
    setLoading(true);
    setUserNotFoundMsg("");
    axios
      .get(`api/users/${searchUser}`)
      .then((response: AxiosResponse<UserAccount>) => {
        if (_.isNil(response.data.GUID))
          setUserNotFoundMsg(
            `A user with the user name of ${searchUser} was not found.  Please TableRowy again.`
          );
        else setSelUser(response.data);
      })
      .catch((response: AxiosResponse<any>) => console.log(response))
      .finally(() => setLoading(false));
  };

  const [tiedUser, setTiedUser] = useState<UserAccount | null>(null);

  const tieUserAndEmp = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.post("api/users", {
        userGuid: selUser?.GUID,
        workerPersId: selWorker?.PersonId,
      });
      setTiedUser(response.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
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
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <TextField
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
                  <IconButton onClick={() => searchForUser()}>
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
            <Button onClick={() => tieUserAndEmp()}>Tie Worker and User</Button>
          </Grid>
        )}
        <Grid item xs={12}>
          {JSON.stringify(tiedUser)}
        </Grid>
      </Grid>
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

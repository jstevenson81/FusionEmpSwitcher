import { Alert, Box, Grid, Typography } from '@mui/material'
import React from 'react'

import { PodUserAccount, PodWorker } from '../lib/libsData'

type UpdateUserNotifProps = {
  message: string;
  onClose(): void;
  notifUser: PodUserAccount;
  notifEmp: PodWorker;
};
const updateUserNotif: React.FC<UpdateUserNotifProps> = ({
  message,
  onClose,
  notifEmp,
  notifUser,
}: UpdateUserNotifProps): JSX.Element => {
  return (
    <Grid item xs={12}>
      <Alert
        severity="success"
        onClose={() => onClose()}
        sx={{ width: "100%" }}
      >
        <Typography variant="h6">Updated {notifUser.Username}</Typography>
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption">
            Congratulations! You updated the user account:{" "}
            <strong>{notifUser.Username}</strong> to be the employee:{" "}
            {notifEmp.names[0].DisplayName} - {notifEmp.PersonNumber}.
          </Typography>
        </Box>
        <Typography variant="caption" component="small">
          <strong>
            NOTE: If you want to switch back, just select the employee from the
            drop down list and tie back to that user account.
          </strong>
        </Typography>
      </Alert>
    </Grid>
  );
};

export default updateUserNotif;

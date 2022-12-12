import { Logout } from '@mui/icons-material'
import { Box, IconButton, Typography } from '@mui/material'
import React from 'react'

type loggedInUserProps = {
  userName: string;
  logout(): void;
};
const loggedInUser: React.FC<loggedInUserProps> = ({
  userName,
  logout,
}: loggedInUserProps): JSX.Element => {
  return (
    <Box sx={{ textAlign: "right", mb: 4 }}>
      <IconButton sx={{ mr: 1 }} onClick={() => logout()}>
        <Logout></Logout>
      </IconButton>
      <Typography variant="caption">Logged In: {userName}</Typography>
    </Box>
  );
};

export default loggedInUser;

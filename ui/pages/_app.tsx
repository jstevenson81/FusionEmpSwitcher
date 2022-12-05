import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { Box, createTheme, CssBaseline, Paper, ThemeProvider, Typography } from '@mui/material'

import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  const theme = createTheme({
    palette: {
      mode: "dark",
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ bgcolor: "#455464", width: "100%", p: 4, mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            color: "#ffffff",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          Fusion User Context Switcher
        </Typography>
      </Box>
      <Paper elevation={8} sx={{ px: 4, py: 6, mx: 10 }}>
        <Component {...pageProps} />
      </Paper>
    </ThemeProvider>
  );
}

import { Backdrop, CircularProgress } from '@mui/material'

type loaderProps = {
  isLoading: boolean;
};
const Loader: React.FC<loaderProps> = ({
  isLoading,
}: loaderProps): JSX.Element => {
  return (
    <Backdrop open={isLoading} sx={{ zIndex: 99999999999 }}>
      <CircularProgress
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    </Backdrop>
  );
};

export default Loader;

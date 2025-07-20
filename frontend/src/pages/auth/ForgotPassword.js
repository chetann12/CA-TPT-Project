import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { forgotPassword, clearError, clearSuccess } from '../../store/slices/authSlice';
import FirmHeader from '../../components/FirmHeader';
import FirmFooter from '../../components/FirmFooter';

const validationSchema = Yup.object({
  pan: Yup.string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')
    .required('PAN is required'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      pan: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      dispatch(clearError());
      dispatch(clearSuccess());
      await dispatch(forgotPassword(values.pan.toUpperCase()));
    },
  });

  return (
    <>
      <FirmHeader />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Forgot Password
            </Typography>
            <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
              Enter your PAN to reset your password
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                id="pan"
                name="pan"
                label="PAN"
                value={formik.values.pan}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.pan && Boolean(formik.errors.pan)}
                helperText={formik.touched.pan && formik.errors.pan}
                disabled={loading}
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>

              <Typography variant="body2" color="text.secondary" align="center">
                Remember your password?{' '}
                <Button
                  color="primary"
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none' }}
                >
                  Login
                </Button>
              </Typography>
            </form>
          </CardContent>
        </Card>
      </Box>
      <FirmFooter />
    </>
  );
};

export default ForgotPassword; 
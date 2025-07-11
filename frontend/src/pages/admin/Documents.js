import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { selectDocuments } from '../../store/slices/documentSlice';

const AdminDocuments = () => {
  const documents = useSelector(selectDocuments);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Document Management
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              All Documents
            </Typography>
            {/* Add document management interface here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDocuments; 
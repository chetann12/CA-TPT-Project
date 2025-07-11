import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Stack
} from '@mui/material';
import PreviewIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import axios from '../utils/axios';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

const getFinancialYears = () => {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    const start = currentYear - i - 1;
    const end = currentYear - i;
    years.push(`${start}-${end.toString().slice(-2)}`);
  }
  return years;
};

const Documents = () => {
  const [financialYear, setFinancialYear] = useState(getFinancialYears()[0]);
  const [categories, setCategories] = useState(null);
  const [docs, setDocs] = useState({ 'income-tax': [], gst: [] });
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    axios.get('/api/documents/categories')
      .then(res => setCategories(res.data))
      .catch(() => setCategories(null));
  }, []);

  useEffect(() => {
    if (!categories) return;
    setLoading(true);
    Promise.all([
      axios.get('/api/documents', { params: { category: 'income-tax', financialYear } }),
      axios.get('/api/documents', { params: { category: 'gst', financialYear } })
    ]).then(([itRes, gstRes]) => {
      setDocs({ 'income-tax': itRes.data, gst: gstRes.data });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [financialYear, categories]);

  const supportedPreviewTypes = ['pdf', 'docx', 'jpg', 'jpeg', 'png'];
  const getFileExtension = (fileName) => fileName.split('.').pop().toLowerCase();

  const handleDownload = async (docId, fileName) => {
    try {
      const response = await axios.get(`/api/documents/${docId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download file');
    }
  };

  const handlePreview = async (docId, fileName) => {
    try {
      const ext = getFileExtension(fileName);
      const response = await axios.get(`/api/documents/${docId}/download`, {
        responseType: 'blob',
      });
      let mimeType = '';
      if (ext === 'pdf') mimeType = 'application/pdf';
      else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
      else if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else mimeType = response.data.type || '';
      const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      if (ext === 'pdf' || ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
        window.open(url, '_blank');
      } else if (ext === 'docx') {
        setPreviewUrl(url);
        setPreviewType(ext);
        setPreviewOpen(true);
      } else {
        alert('Preview not supported for this file type.');
      }
    } catch (err) {
      alert('Failed to preview file');
    }
  };

  const renderTable = (catKey) => {
    if (!categories) return null;
    const types = categories[catKey]?.types || [];
    const uploaded = docs[catKey] || [];
    return (
      <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Document Type</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {types.map(type => {
              const doc = uploaded.find(d => d.documentType === type);
              return (
                <TableRow key={type}>
                  <TableCell>{type}</TableCell>
                  <TableCell>
                    {doc ? (
                      <Stack direction="row" spacing={1}>
                        {supportedPreviewTypes.includes(getFileExtension(doc.fileName)) && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PreviewIcon />}
                            onClick={() => handlePreview(doc._id, doc.fileName)}
                          >
                            Preview
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(doc._id, doc.fileName)}
                        >
                          Download
                        </Button>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Documents
      </Typography>

      <FormControl sx={{ minWidth: 220, mb: 4 }} size="small">
        <InputLabel>Financial Year</InputLabel>
        <Select
          value={financialYear}
          label="Financial Year"
          onChange={e => setFinancialYear(e.target.value)}
        >
          {getFinancialYears().map(year => (
            <MenuItem key={year} value={year}>{year}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        categories && (
          <>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }} color="primary">
              {categories['income-tax']?.name}
            </Typography>
            {renderTable('income-tax')}
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }} color="primary">
              {categories['gst']?.name}
            </Typography>
            {renderTable('gst')}
          </>
        )
      )}

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {previewType === 'docx' && (
            <iframe
              src={previewUrl}
              title="Document Preview"
              width="100%"
              height="600px"
              style={{ border: 'none' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Documents;

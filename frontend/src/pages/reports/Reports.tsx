import React from 'react';
import { Box } from '@mui/material';
import TransactionSummaryReport from './TransactionSummaryReport';

const Reports: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <TransactionSummaryReport />
    </Box>
  );
};

export default Reports;

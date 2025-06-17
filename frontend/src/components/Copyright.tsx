import React from 'react';
import { Typography, Link } from '@mui/material';

interface CopyrightProps {
  companyName?: string;
  companyUrl?: string;
}

const Copyright: React.FC<CopyrightProps> = ({ 
  companyName = 'FamiSuper', 
  companyUrl = '#' 
}) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2, mb: 2 }}>
      {'Copyright © '}
      <Link color="inherit" href={companyUrl}>
        {companyName}
      </Link>
      {' '}
      {currentYear}
      {'. Todos los derechos reservados.'}
    </Typography>
  );
};

export default Copyright;

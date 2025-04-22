"use client"
import { useTheme } from '@mui/material/styles';
import { useEffect } from 'react';

export default function ThemeColorManager() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Define different colors for light and dark themes
  const themeColor = isDarkMode ? '#202020' : '#378FE7';
  
  useEffect(() => {
    // Update meta tags based on the current theme
    const metaTags = document.querySelectorAll('meta[name="theme-color"], meta[name="msapplication-TileColor"]');
    metaTags.forEach(tag => {
      tag.setAttribute('content', themeColor);
    });
  }, [themeColor]);

  // This component doesn't render anything visible
  return null;
}

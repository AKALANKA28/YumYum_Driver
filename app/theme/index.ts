const lightTheme = {
    colors: {
      primary: '#000000',        // Black
      secondary: '#f23f07',      
      background: '#FFFFFF',     // White
      cardBackground: '#F8F8F8', // Light gray for cards
      text: '#000000',           // Black
      lightText: '#666666',      // Gray for secondary text
      error: '#E50914',          // Red for errors
      success: '#f23f07',        // Green for success states
      warning: '#FFC107',        // Yellow for warnings
      border: '#E0E0E0',         // Light gray for borders
      inputBackground: '#F5F5F5', // Light gray for input backgrounds
      buttonText: '#FFFFFF',     // White for button text
      disabledButton: '#CCCCCC', // Gray for disabled buttons
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      small: 4,
      medium: 8,
      large: 16,
    },
    fontSizes: {
      small: 12,
      medium: 14,
      regular: 16,
      large: 18,
      xlarge: 24,
      xxlarge: 32,
    },
    fontWeights: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
  };


  

  const darkTheme = {
    colors: {
      primary: '#FFFFFF',
      secondary: '#ff6b3d',
      background: '#121212',
      cardBackground: '#1E1E1E',
      text: '#FFFFFF',
      lightText: '#BBBBBB',
      // ...rest of the colors with dark mode adaptations
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      small: 4,
      medium: 8,
      large: 16,
    },
    fontSizes: {
      small: 12,
      medium: 14,
      regular: 16,
      large: 18,
      xlarge: 24,
      xxlarge: 32,
    },
    fontWeights: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
  };

  export const themes = {
    light: lightTheme,
    dark: darkTheme,
  };
  
  export type Theme = typeof lightTheme;
  export default themes.light; // Default to light theme
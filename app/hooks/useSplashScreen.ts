// import { useEffect, useState } from 'react';

// export default function useSplashScreen(duration = 2500) {
//   const [isVisible, setIsVisible] = useState(true);
  
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsVisible(false);
//     }, duration);
    
//     return () => clearTimeout(timer);
//   }, [duration]);
  
//   return isVisible;
// }
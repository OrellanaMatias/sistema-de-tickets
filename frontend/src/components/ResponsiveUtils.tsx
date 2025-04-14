import * as React from 'react';

// Hook para detectar el tamaño de la pantalla
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  React.useEffect(() => {
    // Función para actualizar el tamaño de la ventana
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Agregar el evento de resize
    window.addEventListener('resize', handleResize);
    
    // Limpiar el evento cuando el componente se desmonte
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Hook para detectar si la vista es móvil
export const useIsMobile = () => {
  const { width } = useWindowSize();
  return width < 768; // 768px es el breakpoint para md en Tailwind
};

// Hook para detectar orientación
export const useOrientation = () => {
  const { width, height } = useWindowSize();
  return width > height ? 'landscape' : 'portrait';
};

// Componente para mostrar contenido condicional basado en el tamaño de la pantalla
interface ResponsiveProps {
  children: React.ReactNode;
  condition: 'mobile' | 'desktop' | 'tablet' | 'landscape' | 'portrait';
}

export const Responsive: React.FC<ResponsiveProps> = ({ children, condition }) => {
  const { width } = useWindowSize();
  const orientation = useOrientation();
  
  // Evaluación de condiciones
  const shouldRender = (() => {
    switch(condition) {
      case 'mobile':
        return width < 768;
      case 'tablet':
        return width >= 768 && width < 1024;
      case 'desktop':
        return width >= 1024;
      case 'landscape':
        return orientation === 'landscape';
      case 'portrait':
        return orientation === 'portrait';
      default:
        return true;
    }
  })();
  
  return shouldRender ? <>{children}</> : null;
};

// Función para truncar texto largo
export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Componente para texto truncado responsive
interface TruncatedTextProps {
  text: string;
  maxLength: number;
  className?: string;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({ 
  text, 
  maxLength, 
  className = '' 
}) => {
  const isMobile = useIsMobile();
  const displayText = isMobile ? truncateText(text, maxLength) : text;
  
  return (
    <span className={className} title={text}>
      {displayText}
    </span>
  );
};

// Opciones predefinidas para diseño de grid responsive
export const gridLayouts = {
  standard: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  dashboard: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  twoColumn: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  oneColumn: 'grid grid-cols-1 gap-4',
};

export default {
  useWindowSize,
  useIsMobile,
  useOrientation,
  Responsive,
  truncateText,
  TruncatedText,
  gridLayouts
}; 
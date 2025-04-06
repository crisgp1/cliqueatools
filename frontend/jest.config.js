export default {
  // Entorno de prueba: jsdom simula un navegador para probar componentes de React
  testEnvironment: 'jsdom',
  
  // Directorios donde Jest buscará los archivos de prueba
  testMatch: ['**/__tests__/**/*.js?(x)', '**/*.test.js?(x)'],
  
  // Transformadores para diferentes tipos de archivos
  transform: {
    // Transformador para archivos JS/JSX usando Babel
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Configuración para manejar importaciones de archivos no-JS
  moduleNameMapper: {
    // Manejar importaciones de CSS, SCSS, etc.
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // Manejar importaciones de archivos estáticos (imágenes, SVG, etc.)
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Manejar importaciones de archivos JSON (como las animaciones Lottie)
    '\\.json$': '<rootDir>/__mocks__/jsonMock.js',
  },
  
  // Archivos que se ejecutarán antes de las pruebas
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Ignorar archivos y carpetas en la cobertura
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Archivos que Jest ignorará al buscar pruebas
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Extensiones de archivo que Jest reconocerá
  moduleFileExtensions: ['js', 'jsx', 'json'],
  
  // Transformar los valores absolutos de las rutas de importación a rutas relativas
  // Esto es especialmente útil para proyectos que usan alias de importación
  moduleDirectories: ['node_modules', 'src'],
};
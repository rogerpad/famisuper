module.exports = {
  // Extender la configuración de webpack de Create React App
  webpack: {
    configure: (webpackConfig) => {
      // Ignorar advertencias de source map para html2pdf.js
      webpackConfig.ignoreWarnings = [
        {
          module: /html2pdf\.js/,
          message: /Failed to parse source map/,
        },
      ];
      return webpackConfig;
    },
  },
};

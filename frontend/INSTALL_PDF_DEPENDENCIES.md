# Instalación de Dependencias para Exportar PDF

Para que funcione la funcionalidad de exportar a PDF en el componente CierreSuperDetail, necesitas instalar las siguientes dependencias:

## Comando de instalación:

```bash
npm install jspdf html2canvas
```

## Dependencias de tipos (si usas TypeScript):

```bash
npm install --save-dev @types/jspdf
```

## Descripción de las librerías:

- **jspdf**: Librería para generar archivos PDF en el navegador
- **html2canvas**: Librería para convertir elementos HTML a canvas/imagen
- **@types/jspdf**: Tipos de TypeScript para jsPDF

## Uso:

Una vez instaladas las dependencias, el botón "Exportar PDF" en el detalle de cierre super funcionará correctamente.

El PDF generado incluirá:
- Información del usuario y fecha
- Resumen financiero completo
- Detalles de ingresos
- Transferencias
- Egresos

El archivo se descargará automáticamente con el nombre: `cierre-super-{id}-{fecha}.pdf`

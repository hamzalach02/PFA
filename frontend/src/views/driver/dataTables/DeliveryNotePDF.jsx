import React, { useEffect } from 'react';

const loadPdfMakeScripts = () => {
  return new Promise((resolve, reject) => {
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/pdfmake.min.js';
    script1.onload = () => {
      const script2 = document.createElement('script');
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/vfs_fonts.js';
      script2.onload = resolve;
      script2.onerror = reject;
      document.body.appendChild(script2);
    };
    script1.onerror = reject;
    document.body.appendChild(script1);
  });
};

const DeliveryNotePDF = ({ packageItem }) => {
  useEffect(() => {
    loadPdfMakeScripts();
  }, []);

  const generatePdf = (packageItem) => {
    const documentDefinition = {
      content: [
        { text: 'Delivery Note', style: 'header' },
        { text: `Package ID: ${packageItem.id}` },
        { text: `Source: ${packageItem.source}` },
        { text: `Destination: ${packageItem.destination}` },
        { text: `Weight: ${packageItem.weight} kg` }
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          margin: [0, 0, 0, 10]
        }
      }
    };

    window.pdfMake.createPdf(documentDefinition).open();
  };

  return (
    <button onClick={() => generatePdf(packageItem)}>Generate PDF</button>
  );
};

export default DeliveryNotePDF;

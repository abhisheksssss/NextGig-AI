import React from 'react';

interface PDFViewerProps {
  pdfUrl: string ; // Cloudinary PDF URL
}

const PDFViewerBox: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Resume Preview</h3>
      <div className="w-full h-[600px]">
        <iframe
          src={pdfUrl}
          title="User Resume"
          className="w-full h-full rounded"
          frameBorder="0"
        ></iframe>
      </div>
    </div>
  );
};

export default PDFViewerBox;

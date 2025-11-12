import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadAreaProps {
  handleFileUpload: (fileType: string) => (e: React.ChangeEvent<HTMLInputElement> | { target: { files: File[] | null } }) => Promise<boolean>;
  uploadingFile: string | null;
  isPremium: boolean;
}

const UploadArea = ({ handleFileUpload, uploadingFile, isPremium }: UploadAreaProps) => {
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      const file = acceptedFiles[0];
      // Create a synthetic event object
      const event = {
        target: {
          files: [file]
        }
      };
      handleFileUpload('pdf')(event)
        .then((success: boolean) => {
          if (success) {
            setUploadSuccess(file.name);
            // Clear success message after 3 seconds
            setTimeout(() => setUploadSuccess(null), 3000);
          }
        })
        .catch((error: unknown) => {
          console.error('Upload error:', error);
          setUploadSuccess(null);
        });
    }
  }, [handleFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <div className="p-1 bg-white w-full">
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer
          flex flex-col items-center justify-center
          p-3 rounded-md border border-dashed
          transition-colors duration-200 min-h-[100px]
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-[#CCC] bg-[#F9F9F9]'}
          hover:border-blue-400 hover:bg-blue-50
        `}
      >
        <input {...getInputProps()} />
        
        <h3 className="text-base font-medium text-gray-700 mb-0.5 text-center">
          Drag a PDF here or click to upload
        </h3>
        
        <p className="text-xs text-gray-500 mb-2 text-center">
          Simplify your paper and make it easier to understand.
        </p>

        <button
          className="px-2.5 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          Browse Files
        </button>

        {uploadingFile === 'pdf' && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
            <div className="text-xs text-blue-600">Uploading...</div>
          </div>
        )}

        {uploadSuccess && (
          <div className="absolute inset-0 bg-green-50/90 flex flex-col items-center justify-center rounded-md">
            <div className="text-sm font-medium text-green-600 mb-1">
              Uploaded successfully!
            </div>
            <div className="text-xs text-green-500">
              {uploadSuccess}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadArea; 
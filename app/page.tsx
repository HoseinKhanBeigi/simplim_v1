"use client";
import PDFViewer from "@/app/components/pdfViewer";
import Chat from "@/app/components/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import UploadArea from "@/app/components/uploadArea";

interface PDFFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

interface Message {
  role: string;
  content: string;
}

export default function Home() {
  const [currentFile, setCurrentFile] = useState<PDFFile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL when file changes or component unmounts
  useEffect(() => {
    return () => {
      if (currentFile?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(currentFile.url);
      }
    };
  }, [currentFile]);

  const handleFileSelect = useCallback(
    (selectedFile: any) => {
    setCurrentFile(selectedFile);
    setDrawerOpen(false);
    },
    [setCurrentFile, setDrawerOpen]
  );

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // Revoke previous object URL if any
      if (currentFile?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(currentFile.url);
      }
      const objectUrl = URL.createObjectURL(file);
      setCurrentFile({
        url: objectUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      });
      setIsLoading(true);
      setCurrentPage(1);
    },
    [currentFile, setCurrentFile, setIsLoading, setCurrentPage]
  );

  const handleTextContentChange = useCallback((data: any) => {
    console.log("Text content changed:", data);
  }, []);

  const handleLoadComplete = useCallback((data: any) => {
    console.log("PDF loaded complete:", data);
  }, []);

  const handleLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      console.log("PDF loaded with pages:", numPages);
    setNumPages(numPages);
      setIsLoading(false);
    },
    [setNumPages, setIsLoading]
  );

  const handleLoadError = useCallback((error: any) => {
    console.error("PDF loading error:", error);
  }, []);
  const [zoom, setZoom] = useState(1.2);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);


  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const newLeftWidth = (e.clientX / containerWidth) * 100;
      
      // Constrain between 20% and 80%
      const constrainedWidth = Math.max(20, Math.min(80, newLeftWidth));
      setLeftPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const handleZoomIn = useCallback(() => {
    setZoom(zoom + 0.1);
  }, [zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(zoom - 0.1);
  }, [zoom, setZoom]);

  const nextPage = useCallback(() => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, numPages, setCurrentPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage, setCurrentPage]);

  const handleUploadingFile = useCallback(
    (file: any) => {
    setCurrentFile(file);
    setIsLoading(true);
    },
    [setCurrentFile, setIsLoading]
  );

  const handleFileUpload = useCallback(
    (fileType: string) =>
      (
        e:
          | React.ChangeEvent<HTMLInputElement>
          | { target: { files: File[] | null } }
      ) => {
        const file = e.target?.files?.[0] || (e as any).target?.files?.[0];
        if (!file) return Promise.resolve(false);

        // Revoke previous object URL if any
        if (currentFile?.url?.startsWith("blob:")) {
          URL.revokeObjectURL(currentFile.url);
        }

        const objectUrl = URL.createObjectURL(file);
        setCurrentFile({
          url: objectUrl,
          name: file.name,
          size: file.size,
          type: file.type,
        });
        setIsLoading(true);
        setCurrentPage(1);
        return Promise.resolve(true);
      },
    [currentFile, setCurrentFile, setIsLoading, setCurrentPage]
  );


  const handleTextSelect = useCallback((selectedText: string) => {
    // Replace message with newly selected text
    // TODO: Add API call here to get response
    //  setMessage((prev) => (prev ? `${prev}\n${selectedText}` : selectedText));
    setMessage(selectedText);
  }, []);

  const handleExtract = useCallback(async (extractType: 'text' | 'tables' | 'all') => {
    if (!currentFile) return;

    setIsExtracting(true);
    try {
      // Convert blob URL to File if needed
      let file: File;
      if (currentFile.url.startsWith('blob:')) {
        const response = await fetch(currentFile.url);
        const blob = await response.blob();
        file = new File([blob], currentFile.name, { type: currentFile.type });
      } else {
        // If it's a URL, fetch it
        const response = await fetch(currentFile.url);
        const blob = await response.blob();
        file = new File([blob], currentFile.name, { type: currentFile.type });
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', extractType);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Add extraction result to messages
        let content = '';
        
        if (extractType === 'text' || extractType === 'all') {
          content += `**Extracted Text:**\n${result.data.text || 'No text found'}\n\n`;
        }
        
        if (extractType === 'tables' || extractType === 'all') {
          if (result.data.tables && result.data.tables.length > 0) {
            content += `**Extracted Tables:**\n${result.data.tables.length} table(s) found\n`;
            result.data.tables.forEach((table: any, idx: number) => {
              content += `\nTable ${idx + 1}:\n${JSON.stringify(table, null, 2)}\n`;
            });
          } else {
            content += `**Extracted Tables:**\nNo tables found\n`;
          }
        }

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: content || 'Extraction completed' },
        ]);
      } else {
        throw new Error(result.error || 'Extraction failed');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: `Error extracting content: ${error instanceof Error ? error.message : 'Unknown error'}` 
        },
      ]);
    } finally {
      setIsExtracting(false);
    }
  }, [currentFile]);

  return (
    <div ref={containerRef} className="w-full h-screen bg-white flex overflow-hidden">
      {/* Left Section: PDF Viewer */}
      <div className="flex flex-col border-r" style={{ width: `${leftPanelWidth}%` }}>
        {/* PDF Viewer Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b bg-white h-14">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              title="Zoom Out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="text-sm text-gray-600">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              title="Zoom In"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage <= 1}
                className={`p-2 rounded-md transition-colors ${
                  currentPage <= 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="Previous Page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {numPages}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage >= numPages}
                className={`p-2 rounded-md transition-colors ${
                  currentPage >= numPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="Next Page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="h-6 w-px bg-gray-200"></div>
            
            {/* Extraction Buttons */}
            {currentFile && (
              <>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleExtract('text')}
                    disabled={isExtracting}
                    className="px-2.5 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    title="Extract Text"
                  >
                    {isExtracting ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExtract('tables')}
                    disabled={isExtracting}
                    className="px-2.5 py-1 text-xs bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    title="Extract Tables"
                  >
                    {isExtracting ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                    Tables
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExtract('all')}
                    disabled={isExtracting}
                    className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    title="Extract All"
                  >
                    {isExtracting ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600"></div>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    )}
                    All
                  </button>
                </div>
                <div className="h-6 w-px bg-gray-200"></div>
              </>
            )}
            
            <button
              type="button"
              className="px-2.5 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors font-medium"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={onFileInputChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Scrollable PDF viewer area */}
        <div className="flex-1 overflow-auto">
          <div className="flex justify-center">
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
              }}
            >
              <PDFViewer
                file={currentFile}
                currentPage={currentPage}
                scale={zoom}
                onLoadSuccess={handleLoadSuccess}
                uploadingFile={handleUploadingFile}
                onLoadComplete={handleLoadComplete}
                onTextContentChange={handleTextContentChange}
                onTextSelect={handleTextSelect}
                // onLoadError={handleLoadError}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resizable Divider */}
      <div
        className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0 relative group"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 group-hover:w-1.5 transition-all"></div>
      </div>

      {/* Right Section: Chat Interface */}
      <div className="flex flex-col" style={{ width: `${100 - leftPanelWidth}%` }}>
        <Chat
          message={message}
          setMessage={setMessage}
          messages={messages}
          setMessages={setMessages}
        />
      </div>
  </div>
  );
}

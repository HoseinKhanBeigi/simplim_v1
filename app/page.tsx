"use client";
import PDFViewer from "@/app/components/pdfViewer";
import { useCallback, useEffect, useRef, useState } from "react";
import UploadArea from "@/app/components/uploadArea";

interface PDFFile {
  url: string;
  name: string;
  size: number;
  type: string;
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
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!message.trim()) return;

      // Add user message
      const userMessage = { role: "user", content: message };
      setMessages((prev) => [...prev, userMessage]);
      setMessage("");

      // TODO: Add API call here to get response
      // For now, just add a placeholder response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "This is a placeholder response. Connect your API here." },
        ]);
      }, 500);
    },
    [message]
  );

  const handleTextSelect = useCallback((selectedText: string) => {
    // Replace message with newly selected text
    // TODO: Add API call here to get response
    //  setMessage((prev) => (prev ? `${prev}\n${selectedText}` : selectedText));
    setMessage(selectedText);
  }, []);

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
      <div className="flex flex-col bg-gray-50" style={{ width: `${100 - leftPanelWidth}%` }}>
        {/* Chat Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b bg-white h-14">
          <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
          <div></div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-center">
                Start a conversation by typing a message below
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-800 border"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t bg-white p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={!message.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Simplify
              </button>
            </div>
          </form>
        </div>
      </div>
  </div>
  );
}

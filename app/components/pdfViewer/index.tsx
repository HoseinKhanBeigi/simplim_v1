"use client";

import React, { useEffect, useMemo, useRef } from "react";
import dynamic from 'next/dynamic';
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Dynamically import PDF.js components with no SSR
// Configure worker before react-pdf loads to avoid "fake worker" warning
const PDFDocument = dynamic(
  () =>
    import('react-pdf').then(async (reactPdfMod) => {
      // Determine worker URL that matches the API version used by react-pdf
      const version =
        typeof window !== 'undefined' && reactPdfMod.pdfjs
          ? reactPdfMod.pdfjs.version
          : undefined;
      const workerUrl = version
        ? `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
        : '/pdf.worker.min.mjs'; // fallback to local copy if version not available

      // Configure both react-pdf's pdfjs and pdfjs-dist (if available) to the same worker
      if (typeof window !== 'undefined') {
        try {
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        } catch {
          // ignore if pdfjs-dist import fails; react-pdf config below is sufficient
        }
        if (reactPdfMod.pdfjs) {
          reactPdfMod.pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        }
      }
      return reactPdfMod.Document;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading PDF viewer...</span>
      </div>
    ),
  }
);

const PDFPage = dynamic(() => import('react-pdf').then(mod => mod.Page), {
  ssr: false,
});

interface PDFViewerProps {
  uploadingFile: any;
  file: any;
  currentPage: number;
  scale?: number;
  onLoadSuccess: (data: any) => void;
  onLoadComplete: (data: any) => void;
  onTextContentChange: (data: any) => void;
  onTextSelect?: (text: string) => void;
}

function PDFViewer({
  uploadingFile,
  file,
  currentPage,
  scale = 1.2,
  onLoadSuccess,
  onLoadComplete,
  onTextContentChange,
  onTextSelect,
}: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize options to prevent unnecessary reloads
  const options = useMemo(
    () => ({
      cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/",
      useSystemFonts: true,
      disableFontFace: false,
    }),
    []
  );

  const handlePageLoadSuccess = async (page: any) => {
    if (!containerRef.current || typeof window === "undefined") return;
 
  };

  // Handle text selection from PDF
  useEffect(() => {
    if (!onTextSelect || !file) return;

    let lastSelectedText = '';
    let selectionTimeout: NodeJS.Timeout;

    const checkAndProcessSelection = () => {
      clearTimeout(selectionTimeout);
      
      selectionTimeout = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          return;
        }

        const selectedText = selection.toString().trim();
        
        // Only process if there's text and it's different from last selection
        if (!selectedText || selectedText === lastSelectedText) {
          return;
        }

        const container = containerRef.current;
        if (!container) return;

        try {
          const range = selection.getRangeAt(0);
          
          // Check if selection is within the container or PDF text layers
          const startNode = range.startContainer;
          const endNode = range.endContainer;
          const commonAncestor = range.commonAncestorContainer;
          
          // Check PDF text layers first (most reliable)
          const pdfTextLayers = container.querySelectorAll('.react-pdf__Page__textContent, .react-pdf__Page__textContent span');
          let isInPDF = false;
          
          for (let i = 0; i < pdfTextLayers.length; i++) {
            const layer = pdfTextLayers[i];
            if (layer.contains(startNode as Node) || layer.contains(endNode as Node) || layer.contains(commonAncestor as Node)) {
              isInPDF = true;
              break;
            }
          }
          
          // Also check container directly
          const isInContainer = 
            isInPDF ||
            container.contains(startNode as Node) ||
            container.contains(endNode as Node) ||
            container.contains(commonAncestor as Node) ||
            (startNode.nodeType === Node.TEXT_NODE && container.contains(startNode.parentElement as Node)) ||
            (endNode.nodeType === Node.TEXT_NODE && container.contains(endNode.parentElement as Node));

          if (isInContainer) {
            lastSelectedText = selectedText;
            console.log('Selected text from PDF:', selectedText);
            onTextSelect(selectedText);
          } else {
            console.log('Selection not in PDF container', { 
              hasContainer: !!container, 
              startNode: startNode.nodeName,
              endNode: endNode.nodeName 
            });
          }
        } catch (error) {
          // Ignore errors from invalid ranges
          console.debug('Selection error:', error);
        }
      }, 200);
    };

    // Listen for selection changes
    document.addEventListener('selectionchange', checkAndProcessSelection);
    
    // Also listen for mouseup as a fallback
    const handleMouseUp = () => {
      checkAndProcessSelection();
    };
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('selectionchange', checkAndProcessSelection);
      document.removeEventListener('mouseup', handleMouseUp);
      clearTimeout(selectionTimeout);
    };
  }, [onTextSelect, file]);

  if (!file) return null;

  return (
    <div className="flex flex-col flex-1">
      <div
        ref={containerRef}
        className="relative pdf-viewer"
        style={{ 
          cursor: "text", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "flex-start",
          width: "100%",
          padding: "1rem"
        }}
      >
        <PDFDocument
          file={file?.url || ''}
          onLoadSuccess={onLoadSuccess}
          loading={
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3">Loading PDF...</span>
            </div>
          }
          error={
            <div className="flex justify-center items-center p-8 text-red-500">
              Error loading PDF!
            </div>
          }
          options={options}
        >
          <PDFPage
            key={`page-${currentPage}`}
            pageNumber={currentPage}
            scale={scale}
            className="pdf-page shadow-lg"
            onLoadSuccess={handlePageLoadSuccess}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            }
            error={
              <div className="flex justify-center items-center p-4 text-red-500">
                Error loading page
              </div>
            }
          />
        </PDFDocument>
      </div>
    </div>
  );
}

export default PDFViewer;

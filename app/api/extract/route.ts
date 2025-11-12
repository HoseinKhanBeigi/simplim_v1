import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const extractType = formData.get('type') as string; // 'text', 'tables', 'all'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // TODO: Install and configure Docling
    // For now, return a placeholder response
    // You'll need to: npm install docling
    
    // Example Docling usage (uncomment when installed):
    /*
    import { Docling } from 'docling';
    
    const docling = new Docling();
    const result = await docling.process(file);
    
    let extractedData = {};
    
    if (extractType === 'text' || extractType === 'all') {
      extractedData.text = result.text;
    }
    
    if (extractType === 'tables' || extractType === 'all') {
      extractedData.tables = result.tables;
    }
    
    return NextResponse.json({
      success: true,
      data: extractedData,
      type: extractType
    });
    */

    // Placeholder response
    return NextResponse.json({
      success: true,
      message: 'Extraction endpoint ready. Install docling to enable.',
      data: {
        text: 'Placeholder: Install docling package to extract content from PDF',
        tables: []
      },
      type: extractType
    });

  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


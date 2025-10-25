import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'No Gemini API key found',
        hasApiKey: false
      });
    }

    console.log('Listing available Gemini models...');
    
    // List available models
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('ListModels response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('ListModels error:', errorText);
      return NextResponse.json({ 
        error: `ListModels API error: ${response.status}`,
        errorDetails: errorText,
        hasApiKey: true
      });
    }
    
    const result = await response.json();
    console.log('Available models:', result);
    
    // Extract model names that support generateContent
    const availableModels = result.models?.filter(model => 
      model.supportedGenerationMethods?.includes('generateContent')
    ).map(model => ({
      name: model.name,
      displayName: model.displayName,
      description: model.description
    })) || [];
    
    return NextResponse.json({ 
      success: true,
      hasApiKey: true,
      availableModels,
      allModels: result.models?.map(m => m.name) || []
    });
    
  } catch (e) {
    console.error('ListModels Error:', e);
    return NextResponse.json({ 
      error: e.message,
      hasApiKey: !!process.env.GEMINI_API_KEY,
      stack: e.stack
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Test Insights API: Starting');
    
    const { userId } = await auth();
    console.log('Test Insights API: User ID:', userId);
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        userId: null 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true,
      userId: userId,
      message: 'API is working correctly',
      timestamp: new Date().toISOString()
    });
    
  } catch (e) {
    console.error('Test Insights API Error:', e);
    return NextResponse.json({ 
      error: e.message,
      stack: e.stack 
    }, { status: 500 });
  }
}



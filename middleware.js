import { NextResponse } from 'next/server'

export function middleware(request) {
  const origin = request.headers.get('origin')
  
  // List your allowed sites here
  const allowedOrigins = [
    'https://flexinode.in}', // your felxinode.in
    'http://localhost:3000'               // for local testing
  ]

  // If the origin is in our list, allow it
  if (origin && allowedOrigins.includes(origin)) {
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Handle "Preflight" requests (the browser's check before the actual request)
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers })
    }
    
    return response
  }

  return NextResponse.next()
}

// This ensures CORS only runs on your API routes
export const config = {
  matcher: '/api/:path*',
}
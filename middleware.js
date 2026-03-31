import { NextResponse } from 'next/server'

export function middleware(request) {
  const origin = request.headers.get('origin')
  
  const allowedOrigins = [
    'https://flexinode.in',           // Fixed typo: removed '}'
    'https://www.flexinode.in',       // Added www version
    'https://flexinode-project.vercel.app', // Added Vercel domain
    'http://localhost:3000'
  ]

  if (origin && allowedOrigins.includes(origin)) {
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers })
    }
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
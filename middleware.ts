import { NextResponse } from 'next/server'; import type { NextRequest } from 'next/server'
const APP_TOKEN=process.env.APP_TOKEN
export function middleware(req: NextRequest){
  const { pathname }=new URL(req.url)
  const publicPaths=['/login','/api/login','/_next','/favicon.ico']
  if(publicPaths.some(p=>pathname.startsWith(p))) return NextResponse.next()
  const token=req.nextUrl.searchParams.get('token')
  if(token && APP_TOKEN && token===APP_TOKEN){
    const res=NextResponse.redirect(new URL(pathname, req.url))
    res.cookies.set('hsu_auth','ok',{httpOnly:true,sameSite:'lax',secure:true,path:'/'}); return res
  }
  const auth=req.cookies.get('hsu_auth')?.value; if(auth==='ok') return NextResponse.next()
  return NextResponse.redirect(new URL('/login', req.url))
}
export const config={ matcher:['/((?!_next|favicon.ico).*)'] }
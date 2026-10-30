const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const {NextRequest,NextResponse}=require('next/server');
test('middleware does not duplicate incoming cookies unless refreshed tokens must be forwarded',async()=>{
 const oldUrl=process.env.NEXT_PUBLIC_SUPABASE_URL,oldKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='test';
 let refresh=false;
 const mod={exports:{}};
 const mocks={'next/server':{NextResponse},'./lib/supabase/session-policy':{sessionCookieOptions:x=>x},'@supabase/ssr':{createServerClient:(_url,_key,options)=>({auth:{getUser:async()=>{if(refresh)options.cookies.setAll([{name:'sb-test-auth-token',value:'new-token',options:{path:'/'}}],{});return {data:{user:{id:'test'}}};}}})}};
 new Function('require','exports',ts.transpileModule(fs.readFileSync('middleware.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(name=>mocks[name],mod.exports);
 try {
  const request=()=>new NextRequest('http://localhost/dashboard',{headers:{cookie:'other-app='+ 'a'.repeat(8000),'x-test':'keep'}});
  let response=await mod.exports.middleware(request());
  assert.equal(response.headers.get('x-middleware-override-headers'),null);
  assert.equal(response.headers.get('x-middleware-request-cookie'),null);
  refresh=true;response=await mod.exports.middleware(request());
  assert.ok(response.headers.get('x-middleware-request-cookie').includes('sb-test-auth-token=new-token'));
  assert.equal(response.headers.get('x-middleware-request-x-test'),'keep');
  assert.ok(response.headers.get('set-cookie').includes('sb-test-auth-token=new-token'));
 }finally{if(oldUrl===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=oldUrl;if(oldKey===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY=oldKey;}
});

const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require('typescript');
function load(file,mocks={}){const out={};new Function('require','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText)(name=>name in mocks?mocks[name]:name.startsWith('.')?load(path.resolve(path.dirname(file),name+'.ts')):require(name),out);return out;}
const {cvLanguageHint,translatedCvIds}=load('lib/cv-language.ts');
const english='Built and maintained web applications for local businesses using modern technologies.';
const indonesian='Mengembangkan dan mengelola aplikasi web untuk bisnis lokal menggunakan teknologi modern.';
test('CV language follows each source paragraph, not the UI, review, or proper names',()=>{
 assert.equal(cvLanguageHint(english),'en');assert.equal(cvLanguageHint(indonesian),'id');
 assert.equal(cvLanguageHint('Next.js React Laravel UMKM Kutai Kartanegara'),null);
 assert.deepEqual(translatedCvIds([{id:'a',text:indonesian}],[{id:'a',text:english}]),['a']);
 assert.deepEqual(translatedCvIds([{id:'a',text:english}],[{id:'a',text:indonesian}]),['a']);
 assert.deepEqual(translatedCvIds([{id:'a',text:english},{id:'b',text:indonesian}],[{id:'a',text:english},{id:'b',text:indonesian}]),[]);
});
test('translated suggestions are regenerated once and never returned if the retry still translates',async()=>{
 const previous=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='test-only';
 try{for(const recover of [true,false]){let calls=0,writes=0;
 const route=load('app/api/skor/perbaiki/route.ts',{
 '../../../../lib/supabase/server':{supabaseServer:async()=>({auth:{getUser:async()=>({data:{user:{}}})}})},
 '../../../../lib/plus-access':{hasActivePlus:()=>true},
 '../../../../lib/pdf-repair':{MAX_REPAIR_BYTES:10485760},
 '../../../../lib/docx-repair':{openRepairDocx:()=>({text:english,segments:[{id:'a',text:english}],editableIds:['a'],close(){},apply(){writes++;throw Error('must not write during proposals');}})},
 '../../../../lib/review-config':{REVIEW_TIMEOUT_MS:180000},
 '../../../../lib/gemini-review':{requestGeminiReview:async options=>{calls++;const payload=options.payload();const context=JSON.parse(payload.contents[0].parts[0].text);assert.equal(context.languageById.a,'en');assert.match(payload.systemInstruction.parts[0].text,/LANGUAGE LOCK/);if(calls===2)assert.match(payload.systemInstruction.parts[0].text,/previous response/);return {response:Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({revisions:[{id:'a',text:calls===2&&recover?'Developed and maintained reliable web applications for local businesses.':indonesian}]})}]}}]})};}},
 });
 const body=new FormData();body.set('file',new File(['docx'],'cv.docx'));body.set('action','propose');
 const result=await route.POST(new Request('http://localhost/api/skor/perbaiki',{method:'POST',body}));const data=await result.json();
 assert.equal(result.status,recover?200:502);assert.equal(calls,2);assert.equal(writes,0);assert.equal(data.docx,undefined);
 if(recover)assert.match(data.proposals[0].after,/Developed and/);else{assert.equal(data.proposals,undefined);assert.match(data.error,/bahasa CV/);}
 }}finally{if(previous===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=previous;}
});

const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require('typescript');
function load(file){const mod={exports:{}};new Function('require','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name+'.ts')):require(name),mod.exports);return mod.exports;}
const {readAppearanceCookie,writeAppearanceCookie}=load('lib/appearance-cookie.ts');
const {DEFAULT_APPEARANCE}=load('lib/appearance.ts');
test('appearance cookie restores dark theme and custom colors only for its account',()=>{
 const prior=global.document; global.document={cookie:''};
 try {writeAppearanceCookie({...DEFAULT_APPEARANCE,mode:'dark'},'owner',true);const raw=global.document.cookie.split(';')[0].split('=')[1];assert.equal(readAppearanceCookie(raw,'owner').appearance.mode,'dark');assert.equal(readAppearanceCookie(raw,'owner').systemDark,true);assert.equal(readAppearanceCookie(raw,'someone-else'),null);assert.equal(readAppearanceCookie('broken','owner'),null);assert.ok(global.document.cookie.includes('Path=/dashboard'));}finally{global.document=prior;}
});
test('appearance cookie sanitizes invalid theme values before server rendering',()=>{
 const raw=encodeURIComponent(JSON.stringify({userId:'owner',appearance:{mode:'invalid',background:'red;display:none'},systemDark:'true'}));const result=readAppearanceCookie(raw,'owner');assert.equal(result.appearance.mode,'system');assert.equal(result.appearance.background,DEFAULT_APPEARANCE.background);assert.equal(result.systemDark,false);
});

const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const mod={exports:{}};
new Function('exports',ts.transpileModule(fs.readFileSync('lib/cv-edit-coverage.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(mod.exports);
const {validateCvEditCoverage}=mod.exports;
test('AI must explicitly review every target, including unchanged sentences',()=>{
 const ids=['a','b','c'];
 const answers=ids.map(id=>({id,text:'Original sentence.'}));
 assert.deepEqual(validateCvEditCoverage(answers,ids),answers);
 assert.throws(()=>validateCvEditCoverage(answers.slice(0,2),ids),/seluruh/);
 assert.throws(()=>validateCvEditCoverage([answers[0],answers[0],answers[2]],ids),/paragraf/);
 assert.throws(()=>validateCvEditCoverage([...answers.slice(0,2),{id:'unknown',text:'Text'}],ids),/paragraf/);
});

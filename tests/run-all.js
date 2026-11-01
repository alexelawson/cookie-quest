// Runs every check, one after another, and prints a summary. Run: node tests/run-all.js   (or: npm test)
// 1. Syntax: every .js file must parse. This catches a stray quote after editing story.js on GitHub.
// 2. Every scenario suite, plus the full playthrough and the robustness checks.
const {execFileSync,spawnSync}=require('child_process'), fs=require('fs'), path=require('path');
const root=path.resolve(__dirname,'..'), js=fs.readdirSync(path.join(root,'js')).filter(f=>f.endsWith('.js'));
let failed=0; const lines=[];
for(const f of js){ const r=spawnSync(process.execPath,['--check',path.join(root,'js',f)],{encoding:'utf8'});
  if(r.status){ failed++; lines.push(`SYNTAX ERROR in js/${f}:\n${(r.stderr||'').split('\n').slice(0,5).join('\n')}`) } }
lines.push(`syntax: ${js.length} files checked${failed?`, ${failed} broken`:', all OK'}`);
const suites=['farm-scenarios','birkie-scenarios','golf-scenarios','heist-scenarios','fargo-scenarios','kitchen-scenarios','full-playthrough','robustness'];
if(!failed)for(const s of suites){
  const t0=Date.now(), r=spawnSync(process.execPath,[path.join(__dirname,s+'.js')],{encoding:'utf8',timeout:15*60*1000});
  const out=(r.stdout||'')+(r.stderr||''), pass=(out.match(/^PASS /gm)||[]).length, fails=out.split('\n').filter(l=>l.startsWith('FAIL ')), pe=/page errors: none/.test(out);
  const crashed=!pass&&!fails.length, bad=fails.length||!pe||crashed;
  if(bad)failed++;
  lines.push(`${bad?'✗':'✓'} ${s.padEnd(18)} ${pass} passed${fails.length?`, ${fails.length} FAILED`:''}${pe?'':', page errors or crash'}  (${((Date.now()-t0)/1000).toFixed(0)}s)`);
  for(const f of fails)lines.push('    '+f.slice(0,220));
  if(crashed||!pe)lines.push('    '+out.split('\n').filter(l=>/error|Error/.test(l)).slice(0,4).join('\n    '));
}
console.log(lines.join('\n')); console.log(failed?`\n${failed} problem(s).`:'\nEverything passed.'); process.exit(failed?1:0);

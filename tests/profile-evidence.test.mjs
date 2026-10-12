import test from 'node:test';
import assert from 'node:assert/strict';
import {profileCapabilityEvidence} from '../src/components/landscape/profile-evidence.ts';
const cases=[
 ['ai api integration','jobpilot-ai','MahmoudAbdulGhani/jobpilot-ai','Reviewed AI/manual profile integration.','Reviewed AI changes'],
 ['django','construction-project-management-accounting-system','MahmoudAbdulGhani/Construction-Project-Management-Accounting-System','Refined accounting and financial workflows. Integrated AI using Groq.','Financial calculation and interpretation'],
 ['supabase','lobby','Ahmad-khalaf517/lobby','Contributed to guest access, invitation links and Supabase-backed services.','Guest membership and call access'],
];
test('engineering evidence requires the matching reviewed repository and documented contribution scope',()=>{
 for(const [key,slug,repo,contribution,label]of cases){
  const project={slug,name:'Existing project name',github:`https://github.com/${repo}`,published:true,contributions:[contribution],team:['Owner','Colleague']};
  const group={key,evidence:[]};
  const [reference]=profileCapabilityEvidence(group,[project]);
  assert.equal(reference.href,`/projects/${slug}#engineering`);assert.equal(reference.boundary,label);assert.equal(reference.scope,'Team-project evidence');
  assert.equal(profileCapabilityEvidence(group,[{...project,contributions:[]}]).length,0);
  assert.equal(profileCapabilityEvidence(group,[{...project,github:'https://github.com/unrelated/repository'}]).length,0);
  assert.equal(profileCapabilityEvidence(group,[{...project,published:false}]).length,0);
  assert.equal(profileCapabilityEvidence(group,[{...project,showOnPortfolio:false}]).length,0);
 }
});
test('Collection numbering and compact Cedar name are retained without attributing mechanisms to an individual',()=>{
 const projects=cases.map(([,slug,repo,contribution])=>({slug,name:slug,github:`https://github.com/${repo}`,published:true,contributions:[contribution],teamSize:slug==='jobpilot-ai'?1:4}));
 const references=cases.map(([key])=>profileCapabilityEvidence({key,evidence:[]},projects)[0]);
 assert.deepEqual(references.map(r=>r.number),['01','03','02']);
 assert.equal(references[0].scope,'Project evidence');assert.equal(references[1].name,'Cedar Construction');assert.equal(references[2].scope,'Team-project evidence');
});
test('unreviewed existing references retain their destination; unsupported competencies gain no fabricated proof',()=>{
 const group={key:'argon2',evidence:[{slug:'documented',name:'Documented project'}]},project={slug:'documented',name:'Documented project',myRole:'Developer',ownership:'Team project'};
 const before=JSON.stringify({group,project});
 const [reference]=profileCapabilityEvidence(group,[project]);
 assert.equal(reference.href,'/projects/documented');assert.equal(reference.boundary,undefined);assert.equal(reference.scope,'Team-project evidence');assert.equal(JSON.stringify({group,project}),before);
 assert.deepEqual(profileCapabilityEvidence({key:'unsupported competency',evidence:[]},[project]),[]);
});

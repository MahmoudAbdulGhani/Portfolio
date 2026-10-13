import test from 'node:test';
import assert from 'node:assert/strict';
import {profileCapabilityEvidence,groupedProfileEvidence} from '../src/components/landscape/profile-evidence.ts';
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

test('grouped evidence preserves every prior competency/project association with one reference per project',()=>{
 const projects=cases.map(([,slug,repo,contribution])=>({slug,name:slug,github:`https://github.com/${repo}`,published:true,contributions:[contribution],teamSize:slug==='jobpilot-ai'?1:4}));
 const groups=cases.map(([key,slug],i)=>({key,name:`Capability ${i}`,category:'skills',details:[],evidence:[{slug,name:slug}]}));
 groups.push({key:'typescript',name:'TypeScript',category:'languages',details:[],evidence:[{slug:'jobpilot-ai',name:'JobPilot AI'}]}, {key:'argon2',name:'Argon2',category:'skills',details:['Password hashing'],evidence:[{slug:'other',name:'Other project'}]});
 const before=JSON.stringify({groups,projects}),result=groupedProfileEvidence(groups,projects),rows=[...result.primary,...result.additional];
 assert.deepEqual(result.primary.map(r=>r.number),['01','03','02']);assert.equal(rows.length,4);assert.equal(new Set(rows.map(r=>r.href)).size,4);
 for(const group of groups)for(const reference of profileCapabilityEvidence(group,projects))assert.ok(rows.find(r=>r.slug===reference.slug).competencies.includes(group.name));
 assert.deepEqual(result.primary[0].competencies,['Capability 0','TypeScript']);assert.equal(result.additional[0].href,'/projects/other');
 assert.equal(result.primary[1].scope,'Team-project evidence');assert.equal(result.primary[2].scope,'Team-project evidence');assert.equal(JSON.stringify({groups,projects}),before);
});

test('unsupported preferred boundaries remain ordinary grouped references without invented engineering copy',()=>{
 const group={key:'django',name:'Django',category:'frameworks',details:[],evidence:[{slug:'documented',name:'Documented project'}]};
 const result=groupedProfileEvidence([group],[]);
 assert.equal(result.primary.length,0);assert.equal(result.additional.length,1);assert.equal(result.additional[0].explanation,undefined);
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

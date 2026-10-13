import test from'node:test';import assert from'node:assert/strict';
import{projectNumber,resolveMatchProjects}from'../src/lib/project-evidence.ts';
test('only the accepted Collection assignments receive numbers; filtering never renumbers projects',()=>{
 assert.equal(projectNumber('jobpilot-ai'),'01');assert.equal(projectNumber('lobby'),'02');assert.equal(projectNumber('construction-project-management-accounting-system'),'03');assert.equal(projectNumber('unihub'),undefined);
});
test('match evidence uses current published registry identity and scope, retaining only supported unique project references',()=>{
 const projects=[{slug:'jobpilot-ai',name:'JobPilot AI',published:true,teamSize:1},{slug:'construction-project-management-accounting-system',name:'Full construction identifier',published:true,teamSize:4},{slug:'lobby',name:'Lobby',published:true,team:['Owner','Colleague']},{slug:'hidden',name:'Hidden',published:true,showOnPortfolio:false},{slug:'draft',name:'Draft',published:false}];
 const references=[...projects.map(p=>({slug:p.slug,name:'Invented provider name',portfolioUrl:'https://invalid.example/unsafe',evidence:'Original structured explanation.'})),{slug:'invented',name:'Invented',portfolioUrl:'/invented',evidence:'Unsupported'},{slug:'jobpilot-ai',name:'Duplicate',portfolioUrl:'/duplicate',evidence:'Duplicate'}];
 const before=JSON.stringify({projects,references}),result=resolveMatchProjects(references,projects);
 assert.equal(result.length,3);assert.deepEqual(result.map(p=>p.number),['01','03','02']);assert.equal(result[1].name,'Cedar Construction');assert.equal(result[1].scope,'Team-project evidence');assert.equal(result[2].scope,'Team-project evidence');
 assert.equal(result[0].href,'/projects/jobpilot-ai');assert.equal(result[0].evidence,'Original structured explanation.');assert.equal(JSON.stringify({projects,references}),before);
 assert.deepEqual(resolveMatchProjects(references,[]),[]);
});

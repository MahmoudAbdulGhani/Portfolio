import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import {snapshotPrisma,serve} from './helpers/snapshot-api.mjs';

test('real HTTP matcher/export contracts separate assessment, source facts and candidate copy', async t => {
  const key=crypto.randomBytes(32).toString('hex');
  const oldFetch=globalThis.fetch,oldKey=process.env.GEMINI_API_KEY,oldSecret=process.env.JWT_SECRET;
  process.env.GEMINI_API_KEY='mock-provider-key';process.env.JWT_SECRET=key;
  const content={
    '/api/profile':{name:'Fixture Owner',title:'Full-Stack Software Engineer',languages:'English',socials:[],experience:[
      {id:'backend',role:'Backend Developer',company:'Ishtari',startDate:'2025-12',endDate:'2026-01',cvBullets:['Recorded backend work.']},
      {id:'hub',role:'Full-Stack Developer Intern',company:'The Digital Hub',startDate:'2026-06',endDate:'2026-09',description:'Completed a full-stack software engineering and AI program.'},
    ]},
    '/api/projects':[{id:'web',slug:'web',name:'Recorded web project',published:true,stack:['React','TypeScript'],contributions:['Contributed to validation.'],team:['Owner','Colleague'],cvBullets:['Co-developed recorded web workflows.']}],
    '/api/skills':[{id:'react',name:'React',category:'Frontend'},{id:'ts',name:'TypeScript',category:'Languages'}],'/api/technologies':[],
    '/api/education':[], '/api/certifications':[{id:'aws',title:'AWS re/Start Bootcamp',issuer:'AWS',year:'Jul 2025 – Oct 2025'}],
  };
  const mock=snapshotPrisma(content);globalThis.__portfolioPrisma=mock.prisma;
  const {initialModes,DEFAULT_HEADER}=await import('../src/lib/cv-config.js');
  const catalog={profile:content['/api/profile'],projects:content['/api/projects'],skills:content['/api/skills'],education:[],certifications:content['/api/certifications'],languages:['English']};
  mock.prisma.cvConfiguration={findUnique:async()=>({...initialModes(catalog),header:DEFAULT_HEADER}),create:async()=>assert.fail('No database/configuration write')};
  const {default:app}=await import('../src/app.js');const api=await serve(app);
  const assessment='Recruiter assessment fixture: evaluate fit and verify credentials separately.';
  const calls=[];let mode='success';
  globalThis.fetch=async(url,options)=>{
    assert.match(String(url),/^https:\/\/generativelanguage\.googleapis\.com\//);
    calls.push(JSON.parse(options.body));
    if(mode==='failure')return new Response(JSON.stringify({error:{status:'UNAVAILABLE'}}),{status:503});
    const text=mode==='invalid'?'{broken structured output':JSON.stringify({matchLevel:'Moderate Match',overallMatch:'Recorded skills overlap.',strongMatches:['React'],
      relevantExperience:[{kind:'experience',index:0,evidence:'Invented arbitrary employment claim'},'Untrusted freeform employment inference',{kind:'experience',index:0},{kind:'experience',index:999},{kind:'training',index:0}],
      relevantProjects:[{slug:'web',evidence:'Documented team validation work.'},{slug:'web'},{slug:'invented'}],partialMatches:[],gaps:['Independent credential verification is not supplied.'],recruiterSummary:assessment});
    const result={candidates:[{content:{parts:[{text}]}}]};
    return new Response(String(url).includes('streamGenerateContent')?`data: ${JSON.stringify(result)}\n\n`:JSON.stringify(result));
  };
  const description='Junior React and TypeScript developer working with validated APIs and team projects. Preserve recorded employment types and month-only dates.';
  let token;
  try{
    await t.test('JSON results ground experience references and sign only CV facts',async()=>{
      const response=await api.post('/api/job-match',{jobDescription:description});assert.equal(response.status,200);
      const body=JSON.parse(response.body);token=body.cvToken;
      assert.equal(body.result.recruiterSummary,assessment);
      assert.notEqual(body.result.candidateSummary.text,assessment);
      assert.deepEqual(body.result.relevantExperience,['Full-Stack Developer Intern · The Digital Hub · Jun 2026 – Sep 2026','AWS re/Start Bootcamp · AWS · Jul 2025 – Oct 2025']);
      // Context sorts newest first; index zero must name that record, never a
      // model-supplied duration, contract label or per-reference evidence string.
      assert.equal(body.result.relevantProjects.length,1);
      const payload=jwt.verify(token,key,{issuer:'portfolio-job-match',algorithms:['HS256']});
      assert.equal(payload.result,undefined);assert.equal(JSON.stringify(payload).includes(assessment),false);
      assert.equal(payload.cv.summaryPlan.version,1);
      const prompt=JSON.parse(calls[0].contents[0].parts[0].text.split('\n')[1]);
      const backend=prompt.profile.experience.find(row=>row.company==='Ishtari');
      assert.equal(backend.employmentEvidence.dateRange,'Dec 2025 – Jan 2026');
      assert.equal(backend.employmentEvidence.exactDuration,null);assert.equal(backend.employmentEvidence.employmentType,null);
    });
    await t.test('signed download and legacy tokens return real PDFs, invalid signatures still fail',async()=>{
      const response=await api.postBinary('/api/job-match/tailored-cv',{token});assert.equal(response.status,200);assert.equal(response.body.subarray(0,5).toString(),'%PDF-');
      assert.match(response.headers['cache-control'],/no-store/);
      const legacy=jwt.sign({kind:'tailored-cv',result:{recruiterSummary:assessment,relevantProjects:[{slug:'web'}]}},key,{issuer:'portfolio-job-match',expiresIn:'15m'});
      assert.equal((await api.postBinary('/api/job-match/tailored-cv',{token:legacy})).status,200);
      assert.equal((await api.postBinary('/api/job-match/tailored-cv',{token:token.slice(0,-8)+'tampered'})).status,400);
    });
    await t.test('actual SSE transport has separate candidate copy and no premature request-close abort',async()=>{
      const response=await api.post('/api/job-match',{jobDescription:description+' Streaming variant.',stream:true});
      assert.equal(response.status,200);assert.match(response.body,/event: result/);assert.match(response.body,/event: done/);
      assert.match(response.body,/candidateSummary/);assert.doesNotMatch(response.body,/event: error/);
    });
    await t.test('upstream failure is one diagnosed attempt with a request reference, not an automatic retry',async()=>{
      mode='failure';const count=calls.length;
      const response=await api.post('/api/job-match',{jobDescription:description+' Provider failure variant.',stream:true});
      assert.equal(calls.length-count,1);assert.match(response.body,/event: error/);assert.match(response.body,/requestId/);assert.match(response.headers['x-request-id'],/^[a-f0-9-]{36}$/);
    });
    await t.test('unformattable output fails closed independently of provider availability',async()=>{
      mode='invalid';const response=await api.post('/api/job-match',{jobDescription:description+' Invalid output variant.'});
      assert.equal(response.status,502);assert.match(response.body,/could not be formatted safely/);
    });
    await t.test('assistant and both matcher paths share employment/date and project-scope grounding',async()=>{
      mode='success';
      for(const stream of [false,true])await api.post('/api/assistant',{question:`Explain the recorded role and dates; preserve team contribution boundaries (${stream}).`,stream});
      for(const payload of calls){
        const instruction=payload.systemInstruction.parts[0].text;
        assert.match(instruction,/Month-only dates.*do not establish exact elapsed days/);
        assert.match(instruction,/unspecified employment type must remain unspecified/);
        assert.match(instruction,/personal work only to documented myRole, ownership and contributions/);
      }
    });
  }finally{
    await api.close();delete globalThis.__portfolioPrisma;globalThis.fetch=oldFetch;
    if(oldKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=oldKey;
    if(oldSecret===undefined)delete process.env.JWT_SECRET;else process.env.JWT_SECRET=oldSecret;
  }
});

// Explicitly authorized bounded production AI/CV smoke; never sends Contact.
import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const base = 'https://mahmoud-portfolio-omega.vercel.app';
const output = 'docs/design/phase5/production-provider';
await mkdir(output,{recursive:true});
const questions = [
  {name:'general',path:'/profile',question:'Give a concise recruiter overview of the published portfolio, citing useful project evidence and distinguishing documented personal work from team delivery.'},
  {name:'cedar',path:'/projects/construction-project-management-accounting-system',question:'Explain Cedar’s accounting and advisor implementation. Which parts are deterministic and which involve an AI provider? What does the review actually verify?'},
  {name:'aws',path:'/profile',question:'If I am checking qualifications for hiring, do the AWS re/Start dates establish graduation or an earned AWS certification? State only what the available portfolio evidence establishes.'},
  {name:'digital-hub',path:'/profile',question:'What status can you substantiate for the Digital Hub program? Please separate listed participation dates from evidence of completing or graduating the program.'},
  {name:'ownership',path:'/projects/lobby',question:'Can I credit all of Lobby’s media and access infrastructure to Mahmoud individually? Explain the documented personal scope and collaborative ownership, including any attribution limits.'},
];
const browser = await chromium.launch({channel:'chrome'});
const resume = process.argv.includes('--finish');
const findings=resume?JSON.parse(await readFile(`${output}/findings.json`,'utf8')).findings:[];
try {
  const context=await browser.newContext({viewport:{width:1363,height:936},reducedMotion:'reduce'});
  const page=await context.newPage();
  // No tokens or request payloads are logged. Only the allowed public AI operations may write.
  await page.route('**/*',route=>{
    const path=new URL(route.request().url()).pathname;
    return ['GET','HEAD'].includes(route.request().method())||['/api/assistant','/api/job-match','/api/job-match/tailored-cv'].includes(path)?route.continue():route.abort();
  });
  for (const item of (resume ? [{...questions[1],name:'cedar-retry'}] : questions)) {
    await page.goto(base+item.path);
    await page.getByRole('button',{name:'Ask Portfolio AI',exact:true}).click();
    await page.locator('#assistant-question').fill(item.question);
    const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/assistant');
    await page.getByRole('button',{name:'Send question',exact:true}).click();
    const reply=await response;
    await expect(page.getByRole('button',{name:'Stop generation'})).toHaveCount(0,{timeout:60_000});
    const answer=await page.locator('.assistant-message.assistant').last().innerText();
    const errors=await page.locator('.assistant-message.has-error').allTextContents();
    findings.push({...item,status:reply.status(),transport:reply.headers()['content-type'],answer,errors});
    await page.screenshot({path:`${output}/${item.name}.jpg`,quality:85});
    await writeFile(`${output}/findings.json`,JSON.stringify({date:new Date().toISOString(),environment:'Genuine production provider answers through the existing streaming UI; bounded five questions and one Job Match; no mocked AI',findings},null,2)+'\n');
    console.log(`${item.name}: HTTP ${reply.status()}, ${answer.length} chars, errors=${errors.length}`);
  }
  await page.goto(base+'/profile');
  const standardDownload=page.waitForEvent('download');
  await page.getByRole('button',{name:/Download CV|Download Resume/i}).first().click();
  const standardFile=await standardDownload;
  await standardFile.saveAs(`${output}/standard.pdf`);
  findings.push({name:'standard-cv',downloadError:await standardFile.failure()});
  await page.goto(base+'/job-match');
  const description='We are hiring a full-stack developer to build accessible React and TypeScript interfaces, connect validated REST APIs, work with SQL databases and collaborate using Git and GitHub. Show evidence from personal contributions and team projects. AWS certification is optional; do not assume training dates verify qualifications. Clearly identify skills or experience not demonstrated by the portfolio.';
  await page.locator('#job-description').fill(description);
  const matchResponse=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/job-match');
  await page.getByRole('button',{name:'Check My Fit',exact:true}).click();
  const match=await matchResponse;
  await expect(page.locator('.ai-loading')).toHaveCount(0,{timeout:95_000});
  const report=await page.locator('.ai-report').allTextContents();
  const errors=await page.locator('#job-error').allTextContents();
  findings.push({name:'job-match',description,status:match.status(),transport:match.headers()['content-type'],report,errors});
  await page.screenshot({path:`${output}/job-match.jpg`,quality:85});
  if(await page.getByRole('button',{name:'Download Tailored CV',exact:true}).count()){
    const download=page.waitForEvent('download');
    await page.getByRole('button',{name:'Download Tailored CV',exact:true}).click();
    const file=await download;
    await file.saveAs(`${output}/tailored.pdf`);
    findings.push({name:'tailored-cv',downloadError:await file.failure()});
  }
  await writeFile(`${output}/findings.json`,JSON.stringify({date:new Date().toISOString(),environment:'Genuine production UI/provider responses and CV downloads; no fixtures or Contact submission',findings},null,2)+'\n');
  await context.close();
}finally{await browser.close();}

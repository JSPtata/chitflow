import { test, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
test("complete round, guarded transitions, payout recovery and settled state", async ({ browser }, testInfo) => {
 const context = await browser.newContext({viewport:{width:1440,height:1000}});
 const page = await context.newPage();
 const errors=[]; page.on('pageerror',e=>errors.push(e.message)); const writes=[]; page.on('request', r=>{if(r.url().startsWith('http://127.0.0.1:8001')&&['POST','PATCH'].includes(r.method())) writes.push({path:new URL(r.url()).pathname,method:r.method(),body:r.postData()});});
 const run=Date.now();
 async function api(method,path,data,token,expected=200){
  const r=await context.request.fetch('http://127.0.0.1:8001'+path,{method,data,headers:token?{Authorization:'Bearer '+token}:{}});
  assert.equal(r.status(),expected,`${method} ${path}: ${await r.text()}`);
  return r.json();
 }
 async function user(suffix){
  const password=randomBytes(24).toString('hex');
  const email=`round-smoke-${run}-${suffix}@example.com`;
  const u=await api('POST','/users/register',{name:`Round smoke ${suffix}`,email,phone:`${run}${suffix}`,password});
  const auth=await api('POST','/users/login',{email,password});
  return {...u,token:auth.access_token};
 }
 const manager=await user('1'), member=await user('2');
 const g=await api('POST','/chit-groups/',{name:`Round smoke ${run}`,contribution_amount:100,total_amount:200,number_of_members:2,duration:2},manager.token);
 await api('POST',`/chit-groups/${g.chit_id}/members`,{user_id:member.user_id},manager.token);
 const round=await api('POST',`/chit-groups/${g.chit_id}/rounds`,{round_number:1},manager.token);
 const id=round.round_id;
 await context.addInitScript(token=>{localStorage.setItem('token',token);localStorage.setItem('chitflow:onboarding-complete','1');},manager.token);
 async function loaded(){await page.locator('.round-code-pill').filter({hasText:g.name}).waitFor(); await page.waitForLoadState('networkidle');}
 async function state(s){await expect.poll(async () => (await api('GET',`/chit-groups/${g.chit_id}/rounds`,undefined,manager.token)).find(r=>r.round_id===id).current_state).toBe(s);}
 async function advance(label,s){await page.getByRole('button',{name:`Advance to ${label}`,exact:true}).click();await page.waitForLoadState('networkidle');await state(s);}
 await page.goto(`http://127.0.0.1:5174/rounds/${id}`);await loaded();
 await page.screenshot({path:testInfo.outputPath('round-created-desktop.png'),fullPage:true});
 await advance('Contribute','CONTRIBUTION_OPEN');
 await page.getByLabel('AMOUNT',{exact:true}).fill('100');
 await page.getByLabel('PAYMENT REFERENCE',{exact:true}).fill('local-smoke-manager');
 await page.getByRole('button',{name:'Submit Contribution',exact:true}).click();await page.waitForLoadState('networkidle');
 await api('POST',`/rounds/${id}/contributions`,{amount:100,payment_reference:'local-smoke-member'},member.token);
 await page.reload();await loaded();
 await advance('Verify','CONTRIBUTION_VERIFICATION');
 await advance('Bid','CONTRIBUTION_VERIFICATION'); await page.getByText('2 contributions still require verification.').waitFor();
 for(let i=0;i<2;i++){await page.getByRole('button',{name:'Verify',exact:true}).first().click();await page.waitForLoadState('networkidle');}
 assert.ok((await api('GET',`/rounds/${id}/contributions`,undefined,manager.token)).every(c=>c.payment_status==='VERIFIED'));
 await api('PATCH',`/chit-groups/rounds/${id}/state`,{new_state:'BIDDING_OPEN'},member.token,403);
 await advance('Bid','BIDDING_OPEN'); await advance('Bid Closed','BIDDING_OPEN'); await page.getByText('At least one bid must be recorded before bidding is closed.').waitFor();
 for(const amount of [180,170]){await page.getByLabel('BID AMOUNT',{exact:true}).fill(String(amount));await page.getByRole('button',{name:'Place Bid',exact:true}).click();await page.waitForLoadState('networkidle');}
 assert.equal((await api('GET',`/rounds/${id}/bids`,undefined,manager.token)).length,2);
 assert.equal(await page.locator('.recharts-area-curve').getAttribute('stroke'),'#2563eb');

 assert.equal(await page.locator('.round-main-hero').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(17, 19, 24)');
 await page.screenshot({path:testInfo.outputPath('round-bidding-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);
 assert.ok(await page.locator('[data-tour="round-lifecycle"] .lg\\:hidden').isVisible());
 await page.screenshot({path:testInfo.outputPath('round-bidding-mobile.png'),fullPage:true});
 console.log('Mobile overflow:',await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth})));
 await page.setViewportSize({width:1440,height:1000});
 await advance('Bid Closed','BIDDING_CLOSED');
 // Use the dedicated result endpoint defined in backend routes; do not use generic PATCH to bypass result computation.
 await page.route(`**/rounds/${id}/result`,r=>r.fulfill({status:400,contentType:'application/json',body:JSON.stringify({detail:'Intentional result rejection test'})})); await advance('Result','BIDDING_CLOSED'); await page.getByText('Intentional result rejection test').waitFor(); await page.unroute(`**/rounds/${id}/result`); await advance('Result','RESULT_PROPOSED'); const result=(await api('GET',`/chit-groups/${g.chit_id}/rounds`,undefined,manager.token)).find(r=>r.round_id===id); assert.equal(result.winner_id,manager.user_id); assert.ok((await api('GET',`/rounds/${id}/bids`,undefined,manager.token)).some(b=>b.status==='WINNING')); assert.ok(!writes.some(r=>r.path.endsWith('/state')&&JSON.parse(r.body).new_state==='RESULT_PROPOSED'));
 await page.reload();await loaded();
 await advance('Challenge','CHALLENGE_OPEN');
 const dispute=await api('POST',`/rounds/${id}/disputes`,{dispute_type:'BID_REVIEW',description:'Local smoke test: check recorded bid evidence.'},member.token);
 await page.reload();await loaded();
 assert.equal(await page.getByRole('button',{name:/Advance to/}).count(),0);
 await api('PATCH',`/rounds/disputes/${dispute.dispute_id}/review`,undefined,manager.token);
 await api('PATCH',`/rounds/disputes/${dispute.dispute_id}/resolve`,{resolution:'Local smoke review complete; retain the recorded result.'},manager.token);
 await api('PATCH',`/chit-groups/rounds/${id}/state`,{new_state:'RESULT_CONFIRMED'},manager.token);
 await page.reload();await loaded();
 const beforePayout=writes.length; await page.getByRole('button',{name:'Enter payout details',exact:true}).click(); await page.getByText('Enter the payout information below to continue.').waitFor(); assert.equal(writes.length,beforePayout); await page.getByLabel('PAYOUT AMOUNT',{exact:true}).fill('170');
 await page.getByPlaceholder('Bank / UPI payout reference').fill('local-smoke-payout');
 await page.getByRole('button',{name:'Create Payout',exact:true}).click();await page.waitForLoadState('networkidle');await state('PAYOUT_PENDING');
 const payoutId=await page.evaluate(id=>localStorage.getItem(`chitflow:payout:${id}`),id);assert.ok(payoutId);
 await page.evaluate(id=>localStorage.removeItem(`chitflow:payout:${id}`),id); await page.reload(); await loaded(); await advance('Verify Payout','PAYOUT_VERIFICATION'); assert.equal(await page.evaluate(id=>localStorage.getItem(`chitflow:payout:${id}`),id),String(payoutId)); assert.ok(writes.some(r=>r.path===`/rounds/payouts/${payoutId}/verify`&&r.method==='PATCH')); assert.ok(!writes.some(r=>r.path.endsWith('/state')&&JSON.parse(r.body).new_state==='PAYOUT_VERIFICATION'));
 await page.reload();await loaded();
 await advance('Settled','ROUND_SETTLED');
 assert.equal(await page.getByRole('button',{name:/Advance to/}).count(),0);
 await page.getByText('Round settled',{exact:true}).waitFor();
 const audit=await api('GET',`/rounds/${id}/audit`,undefined,manager.token);assert.ok(audit.length>=10);
 assert.equal((await api('GET',`/rounds/${id}/disputes`,undefined,manager.token)).length,1);
 // Deliberately simulate ONLY the optional disputes request failing. Main API responses remain live.
 await page.route(`**/rounds/${id}/disputes`,r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({detail:'Intentional optional-disputes failure test'})}));
 await page.reload();await loaded();await page.getByText('Round settled',{exact:true}).waitFor();
 assert.equal(await page.locator('.app-message.error').count(),0);
 await page.unroute(`**/rounds/${id}/disputes`);
 await page.locator('[data-tour="help-button"]').click();
 await page.getByRole('heading',{name:'What would you like help with?'}).waitFor();
 await page.getByRole('button',{name:/Replay ChitFlow introduction/}).click();
 await page.waitForLoadState('networkidle');
 assert.ok(await page.getByText('This short walkthrough shows you where to manage groups, members, notifications and help.').isVisible());
 assert.deepEqual(errors,[]);
 console.log('PASS: UI dedicated result and payout verification endpoints; parent guards for pending payments, no bids, server recovery after payout ID storage cleared, rejected result/retry; payout form navigation makes no write; live UI contribution/verification/bidding, creator-only state permission, dedicated result, dispute/review/resolve, payout creation/verification, settlement with no advance action, optional dispute-failure fallback, Help menu and introduction replay; no browser page errors.');
 await context.close();
});

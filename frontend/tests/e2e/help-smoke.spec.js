import { test } from '@playwright/test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
test("all guided tasks, successful actions, retry, navigation, and mobile layout", async ({ browser }, testInfo) => {
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const run=Date.now();const password=randomBytes(24).toString('hex');
 async function api(method,path,data,token){const r=await context.request.fetch('http://127.0.0.1:8001'+path,{method,data,headers:token?{Authorization:'Bearer '+token}:{}});assert.equal(r.status(),200,await r.text());return r.json();}
 const email=`help-smoke-${run}@example.com`;
 await api('POST','/users/register',{name:'Help smoke',email,phone:String(run),password});
 const {access_token:token}=await api('POST','/users/login',{email,password});
 await context.addInitScript(token=>localStorage.setItem('token',token),token);
 await page.goto('http://127.0.0.1:5174/dashboard');await page.waitForLoadState('networkidle');
 const guide=page.getByRole('region',{name:'Guided Help'});
 async function help(topic){await page.locator('[data-tour="help-button"]').click();await page.getByRole('dialog').getByRole('button',{name:topic}).click();await page.waitForLoadState('networkidle');}
 async function next(){await guide.getByRole('button',{name:'Next',exact:true}).click();}
 await page.evaluate(()=>localStorage.setItem('chitflow:start-onboarding','1'));
 await page.reload();await guide.getByRole('heading',{name:'Welcome to ChitFlow',exact:true}).waitFor();
 await guide.getByRole('button',{name:'Skip guide'}).click();assert.equal(await page.evaluate(()=>localStorage.getItem('chitflow:onboarding-complete')),null);
 console.log('PASS: new-account onboarding starts; Skip does not mark completed');
 await help(/Create Chit Group/);
 await page.locator('[data-tour="create-chit-group"]').click();
 await guide.getByRole('heading',{name:'Name your group'}).waitFor();
 const groupName=`Help smoke ${run}`;
 for(const [selector,value] of [['group-name',groupName],['contribution-amount','100'],['member-count','2'],['duration','2']]){await page.locator(`[data-tour="${selector}"]`).fill(value);await next();}
 await guide.getByRole('heading',{name:'Create the group',exact:true}).waitFor();
 let fail=true;
 await page.route('**/chit-groups/',async route=>{if(route.request().method()==='POST'&&fail){fail=false;await route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({detail:'Intentional failed group test'})});}else await route.continue();});
 await page.locator('[data-tour="submit-group"]').click();await page.waitForLoadState('networkidle');
 await guide.getByRole('heading',{name:'Create the group',exact:true}).waitFor();
 assert.equal(await guide.getByText('Task complete',{exact:true}).count(),0);
 await page.locator('[data-tour="submit-group"]').click();await guide.getByText('Task complete',{exact:true}).waitFor();
 await page.unroute('**/chit-groups/');
 const groups=await api('GET','/chit-groups/',undefined,token);const group=groups.find(x=>x.name===groupName);assert.ok(group);
 await guide.getByRole('button',{name:'Done',exact:true}).click();
 console.log('PASS: form-open advancement, field walkthrough, failed submission retained, live successful submission completes');
 await help(/Create Round/);
 await guide.getByRole('heading',{name:'Open the round form',exact:true}).waitFor(); await guide.getByRole('button',{name:'Choose another group'}).click(); await guide.getByRole('heading',{name:'Choose a group you manage'}).waitFor();
 // Navigate using the actual React Router page control.
 const groupCard=page.getByRole('button').filter({has:page.getByText(groupName,{exact:true})});

 await groupCard.click();
 await guide.getByRole('heading',{name:'Open the round form',exact:true}).waitFor();
 await page.locator('[data-tour="create-round"]').click();
 await guide.getByRole('heading',{name:'Configure and create the round'}).waitFor();
 await page.locator('[data-tour="round-form"]').getByRole('button',{name:'Create Round',exact:true}).click();
 await guide.getByText('Task complete',{exact:true}).waitFor();
 await guide.getByRole('button',{name:'Done',exact:true}).click();
 console.log('PASS: create-round tour starts from group list, opens correct group, observes form, confirms server-created round');
 const rounds=await api('GET',`/chit-groups/${group.chit_id}/rounds`,undefined,token);const round=rounds[0];assert.ok(round);
 await help(/Submit Contribution/); await guide.getByRole('button',{name:'Choose another round'}).click(); await page.waitForLoadState('networkidle');
 // Must permit the group detail page while choosing a round.
 await page.getByRole('button').filter({has:page.getByText(groupName,{exact:true})}).click();
 await page.waitForLoadState('networkidle');assert.equal(new URL(page.url()).pathname,`/chits/${group.chit_id}`);
 // Use an existing round navigation button.
 const roundButton=page.getByRole('button',{name:/Open Current Round/}).first();

 await guide.getByRole('button',{name:'Minimize',exact:true}).click(); await roundButton.click();
 await guide.getByRole('heading',{name:'Submit contribution',exact:true}).waitFor();
 await guide.getByText(/Contributions can be submitted only during CONTRIBUTION OPEN/).waitFor();
 await page.setViewportSize({width:320,height:700});await page.waitForTimeout(200);
 const box=await guide.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=320.5&&box.y>=0&&box.y+box.height<=700.5);
 // Change a real round through the API, then let React refresh without remounting the guide.
 await api('PATCH',`/chit-groups/rounds/${round.round_id}/state`,{new_state:'CONTRIBUTION_OPEN'},token);
 await page.evaluate(async()=>{const {default:api}=await import('/src/api/api.js');await api.get('/users/me');});
 // Trigger a router navigation away and back, preserving the guide component.
 await guide.getByRole('button',{name:'Minimize',exact:true}).click(); await page.locator('.round-back-button').click();
 await page.getByRole('button',{name:/Open Current Round/}).first().click();
 await page.getByRole('button',{name:/Resume guide/}).click(); await page.locator('[data-tour="submit-contribution"]').waitFor();
 await page.waitForTimeout(250);
 assert.equal(await guide.getByText(/Contributions can be submitted only during CONTRIBUTION OPEN/).count(),0);
 await page.screenshot({path:testInfo.outputPath('guided-help-mobile.png'),fullPage:false});
 await guide.getByRole('button',{name:'Minimize',exact:true}).click(); await page.getByRole('button',{name:/Resume guide/}).waitFor();
 await page.getByLabel('AMOUNT',{exact:true}).fill('100');await page.getByLabel('PAYMENT REFERENCE',{exact:true}).fill('help-smoke-payment');
 await page.getByRole('button',{name:'Submit Contribution',exact:true}).click();await guide.getByText('Task complete',{exact:true}).waitFor();
 await guide.getByRole('button',{name:'Done',exact:true}).click();
 console.log('PASS: intermediate group navigation retained, missing-control prerequisite, later DOM target detection, 320px tooltip bounds, live contribution completes');
 await help(/Place Bid/);assert.equal(new URL(page.url()).pathname,`/rounds/${round.round_id}`);await guide.getByText(/Bidding is available only during BIDDING OPEN/).waitFor();
 await page.keyboard.press('Escape');assert.equal(await guide.count(),0);
 await page.locator('[data-tour="help-button"]').click();await page.getByRole('dialog').getByRole('button',{name:/Replay ChitFlow introduction/}).click();
 for(let i=0;i<4;i++)await next();await guide.getByRole('button',{name:'Finish',exact:true}).click();await guide.getByText('Task complete',{exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>localStorage.getItem('chitflow:onboarding-complete')),'1');
 console.log('PASS: contextual round retained, Escape closes, introduction replay completes');
 await guide.getByRole('button',{name:'Done',exact:true}).click();
 await page.setViewportSize({width:1440,height:1000});
 const member=await api('POST','/users/register',{name:'Help member',email:`help-member-${run}@example.com`,phone:`${run}2`,password});
 await help(/Add Members/);await page.locator('[data-tour="add-member"]').click();
 await guide.getByRole('heading',{name:'Choose the group',exact:true}).waitFor();
 await page.locator('[data-tour="member-group"]').selectOption(String(group.chit_id));await next();
 await page.locator('[data-tour="member-user-id"]').fill(String(member.user_id));await next();
 await guide.getByRole('button',{name:'Minimize',exact:true}).click();
 await page.locator('[data-tour="submit-member"]').click();await guide.getByText('Task complete',{exact:true}).waitFor();await guide.getByRole('button',{name:'Done',exact:true}).click();
 console.log('PASS: add-member guide confirms real membership creation');
 await api('PATCH',`/chit-groups/rounds/${round.round_id}/state`,{new_state:'CONTRIBUTION_VERIFICATION'},token);
 await page.goto(`http://127.0.0.1:5174/rounds/${round.round_id}`);await page.waitForLoadState('networkidle');
 await help(/Verify Payments/);await guide.getByRole('button',{name:'Minimize',exact:true}).click();
 await page.locator('[data-tour="verify-contributions"]').first().click();await guide.getByText('Task complete',{exact:true}).waitFor();await guide.getByRole('button',{name:'Done',exact:true}).click();
 await api('PATCH',`/chit-groups/rounds/${round.round_id}/state`,{new_state:'BIDDING_OPEN'},token);await page.reload();await page.waitForLoadState('networkidle');
 await help(/Place Bid/);await guide.getByRole('button',{name:'Minimize',exact:true}).click();
 await page.getByLabel('BID AMOUNT',{exact:true}).fill('170');await page.getByRole('button',{name:'Place Bid',exact:true}).click();
 await guide.getByText('Task complete',{exact:true}).waitFor();await guide.getByRole('button',{name:'Done',exact:true}).click();
 console.log('PASS: verify-payment and bid guides confirm real server actions');
 await api('PATCH',`/chit-groups/rounds/${round.round_id}/state`,{new_state:'BIDDING_CLOSED'},token);
 await api('POST',`/rounds/${round.round_id}/result`,undefined,token);
 await api('PATCH',`/chit-groups/rounds/${round.round_id}/state`,{new_state:'CHALLENGE_OPEN'},token);await page.reload();await page.waitForLoadState('networkidle');
 await help(/Handle Dispute/);await guide.getByRole('button',{name:'Minimize',exact:true}).click();
 await page.locator('[data-tour="raise-dispute"] textarea').fill('Guided help smoke: review recorded bid evidence.');
 await page.locator('[data-tour="raise-dispute"]').getByRole('button',{name:'Raise Dispute',exact:true}).click();
 await guide.getByText('Task complete',{exact:true}).waitFor();await guide.getByRole('button',{name:'Done',exact:true}).click();await page.waitForLoadState('networkidle');
 await help(/Handle Dispute/);await guide.getByRole('button',{name:'Minimize',exact:true}).click();
 await page.locator('[data-tour="review-dispute"]').click();await guide.getByText('Task complete',{exact:true}).waitFor();await guide.getByRole('button',{name:'Done',exact:true}).click();await page.waitForLoadState('networkidle');
 await help(/Handle Dispute/);await guide.getByRole('button',{name:'Minimize',exact:true}).click();
 await page.locator('[data-tour="resolve-dispute"] textarea').fill('Reviewed local smoke evidence; retain result.');
 await page.locator('[data-tour="resolve-dispute"]').getByRole('button',{name:'Resolve Dispute',exact:true}).click();
 await guide.getByText('Task complete',{exact:true}).waitFor();await guide.getByRole('button',{name:'Done',exact:true}).click();
 console.log('PASS: dispute guide confirms raise, review, and resolve as separate successful actions');
 await api('PATCH',`/chit-groups/rounds/${round.round_id}/state`,{new_state:'RESULT_CONFIRMED'},token);await page.reload();await page.waitForLoadState('networkidle');
 await help(/Record a Payout/);await guide.getByRole('button',{name:'Minimize',exact:true}).click();
 await page.getByLabel('PAYOUT AMOUNT',{exact:true}).fill('170');await page.getByRole('button',{name:'Create Payout',exact:true}).click();
 await guide.getByText('Task complete',{exact:true}).waitFor();await guide.getByRole('button',{name:'Done',exact:true}).click();
 console.log('PASS: record-payout guide confirms creation without claiming settlement');
 assert.deepEqual(errors,[]); console.log('PASS: all eight task guides and introduction replay; no browser page errors');
 await context.close();
});

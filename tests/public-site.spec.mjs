import {expect,test} from "@playwright/test";

test("public site loads its team routes and print action",async({page})=>{
  await page.addInitScript(()=>{window.__printed=false;window.print=()=>{window.__printed=true;};});
  await page.goto("/");
  await expect(page.getByRole("heading",{name:"Welcome to the Modularity Mallards!"})).toBeVisible();
  await page.getByRole("link",{name:"Sessions"}).click();
  await expect(page.getByRole("button",{name:"Print plan"})).toBeVisible();
  await page.getByRole("button",{name:"Print plan"}).click();
  await expect.poll(()=>page.evaluate(()=>window.__printed)).toBe(true);
  await page.getByRole("link",{name:"Calendar"}).click();
  await expect(page.getByText("0 matches")).toBeVisible();
  await page.getByRole("link",{name:"About Coach"}).click();
  await expect(page.getByRole("heading",{name:"Coach, part-time puddle philosopher"})).toBeVisible();
});

test("private and internal build paths are unavailable",async({request})=>{
  for(const path of ["/docs/","/server/","/data/reflections/","/assets/js/development.js"]){
    expect((await request.get(path)).status(),path).toBe(404);
  }
});

test("security headers from _headers are actually served",async({request})=>{
  const headers=(await request.get("/")).headers();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
});

test("a cold direct load of a deep hash route renders correctly",async({page})=>{
  await page.goto("/#sessions/welcome-ball-control");
  await expect(page.getByRole("button",{name:"Print plan"})).toBeVisible();
});

test("a cold direct load of a route owned by an extension script is not clobbered by the default router",async({page})=>{
  // Regression: app.js's render() used to fall back to home() for any hash it didn't
  // own, including calendar/rules/catalogue - a race with the extension scripts' own
  // async rendering that only showed up on a cold load, not a click.
  await page.goto("/#calendar");
  await expect(page.getByRole("heading",{name:"Team schedule"})).toBeVisible();
  await page.goto("/#catalogue");
  await expect(page.getByRole("heading",{name:"Coaching resources"})).toBeVisible();
  await page.goto("/#terminology");
  await expect(page.getByRole("heading",{name:"Football words"})).toBeVisible();
});

test("terminology page reflects the active league profile's restart rule",async({page})=>{
  // Regression: this page used to hardcode a specific league's restart facts in JS.
  // It now reads them from the league profile, so this exact sentence is a
  // pointer to data/profiles/leagues/demo-u9-academy.json's format.restarts,
  // not independent prose - if it drifts, one of the two is stale.
  await page.goto("/#terminology");
  await expect(page.getByText("For Modularity Mallards:")).toBeVisible();
  await expect(page.getByText("Goal kicks, corner kicks and throw-ins are used; no offside.").first()).toBeVisible();
});

test("a stable per-session URL cold-loads that exact session and stays on it through print",async({page})=>{
  await page.addInitScript(()=>{window.__printed=false;window.print=()=>{window.__printed=true;};});
  await page.goto("/#sessions/protect-turn-escape");
  await expect(page.getByRole("heading",{name:"Protect, turn and escape"})).toBeVisible();
  await page.getByRole("button",{name:"Print plan"}).click();
  await expect.poll(()=>page.evaluate(()=>window.__printed)).toBe(true);
  await expect(page.getByRole("heading",{name:"Protect, turn and escape"})).toBeVisible();
});

test("each session's share URL renders that exact session, distinct from the others",async({page})=>{
  // Draft sessions aren't listed on the Sessions page (see the "public site loads
  // its team routes" test), so this exercises the URL mechanism directly rather
  // than clicking a tab - the tab picker only lists published sessions.
  await page.goto("/#sessions/welcome-ball-control");
  await expect(page.getByRole("heading",{name:"Ball control and movement"})).toBeVisible();
  await page.goto("/#sessions/protect-turn-escape");
  await expect(page.getByRole("heading",{name:"Protect, turn and escape"})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Ball control and movement"})).toHaveCount(0);
});

test("session export produces a standalone .html download built from the same renderer",async({page})=>{
  await page.goto("/#sessions/welcome-ball-control");
  const [download]=await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button",{name:"Download .html"}).click()
  ]);
  expect(download.suggestedFilename()).toBe("welcome-ball-control.html");
  const stream=await download.createReadStream();
  const chunks=[];
  for await(const chunk of stream)chunks.push(chunk);
  const body=Buffer.concat(chunks).toString("utf8");
  expect(body).toContain("Ball control and movement");
  expect(body).toContain("Standing warm-up");
  expect(body).toContain("Session outcomes");
});

test("rules page renders league-driven format and head-injury guidance",async({page})=>{
  await page.goto("/#rules");
  await expect(page.getByRole("heading",{name:"Demo U9 Academy (fictional test data) match format"})).toBeVisible();
  await expect(page.getByText("7v7 with goalkeepers")).toBeVisible();
  await expect(page.getByText("Two 25-minute halves; 5-minute halftime")).toBeVisible();
  await expect(page.getByRole("heading",{name:"When a head injury is suspected"})).toBeVisible();
  await expect(page.getByText("Do not allow a suspected head injury to return")).toBeVisible();
});

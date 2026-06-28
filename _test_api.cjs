// 测试 API 端点
const BASE = "http://localhost:3099";

async function test(name, url, options) {
  try {
    const res = await fetch(`${BASE}${url}`, options);
    const data = await res.json();
    const ok = data.ok === true;
    console.log(`${ok ? "PASS" : "FAIL"} ${name} (${res.status})`);
    if (!ok || res.status >= 400) {
      console.log("  response:", JSON.stringify(data).slice(0, 300));
    }
    return data;
  } catch (e) {
    console.log(`ERR  ${name}: ${e.message}`);
    return null;
  }
}

async function main() {
  // 1. health
  await test("health", "/api/health");

  // 2. 获取已迁移的账号
  const account = await test("getAccount 旅人A", "/api/accounts/" + encodeURIComponent("旅人A"));
  if (account?.account) {
    console.log(`  profile.nickname: ${account.account.profile?.nickname}`);
    console.log(`  journeys: ${account.account.journeys?.length}`);
    console.log(`  selectedPetId: ${account.account.selectedPetId}`);
  }

  // 3. 获取已迁移的会话
  const session = await test("getSession", "/api/sessions/1782181667706");
  if (session?.session) {
    console.log(`  topic: ${session.session.topic}`);
    console.log(`  answers: ${session.session.answers?.length}`);
    console.log(`  persona: ${session.session.persona}`);
  }

  // 4. 登录新账号
  const login = await test("login new", "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginName: "测试用户", petId: "cloud-tiger" }),
  });
  if (login?.account) {
    console.log(`  loginName: ${login.account.loginName}`);
    console.log(`  selectedPetId: ${login.account.selectedPetId}`);
  }

  // 5. 创建 profile
  const profile = await test("createProfile", "/api/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      loginName: "测试用户",
      petId: "cloud-tiger",
      nickname: "测试小白",
      recentHesitation: "要不要学游泳",
      selfScene: "家附近新开了游泳馆",
    }),
  });
  if (profile?.profile) {
    console.log(`  profile.nickname: ${profile.profile.nickname}`);
  }

  // 6. 再次获取账号验证 profile 已保存
  const account2 = await test("getAccount 测试用户", "/api/accounts/" + encodeURIComponent("测试用户"));
  if (account2?.account?.profile) {
    console.log(`  profile saved: ${account2.account.profile.nickname}`);
  } else {
    console.log("  profile NOT saved!");
  }

  console.log("\n测试完成。");
}

main();

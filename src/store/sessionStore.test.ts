import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSessionStore } from "@/store/sessionStore";
import { wavewardApi, type BackendAccount } from "@/services/wavewardApi";
import type { PetId } from "@/types/session";

vi.mock("@/services/wavewardApi", () => ({
  wavewardApi: {
    login: vi.fn(),
    register: vi.fn(),
    autoRegister: vi.fn(),
    updatePet: vi.fn(),
    createProfile: vi.fn(),
    createSession: vi.fn(),
    submitAnswer: vi.fn(),
    generateReport: vi.fn(),
    completeJourney: vi.fn(),
    getAccount: vi.fn(),
    health: vi.fn(),
  },
}));

const mockedApi = vi.mocked(wavewardApi);

function buildAccount(overrides: Partial<{
  loginName: string;
  selectedPetId: PetId;
  profile: BackendAccount["profile"];
  journeys: BackendAccount["journeys"];
  hasPassword: boolean;
}> = {}): BackendAccount {
  return {
    loginName: overrides.loginName ?? "阿澜",
    selectedPetId: overrides.selectedPetId ?? "moon-rabbit",
    profile: overrides.profile ?? null,
    journeys: overrides.journeys ?? [],
    hasPassword: overrides.hasPassword ?? true,
    updatedAt: new Date().toISOString(),
  };
}

describe("useSessionStore account archive", () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({
      isLoggedIn: false,
      loginName: "",
      topic: "",
      persona: "gentle",
      selectedPetId: "moon-rabbit",
      profile: null,
      journeys: [],
      currentStep: 0,
      currentSessionId: 0,
      answers: [],
      accountArchives: {},
      lastAutoPassword: "",
    });
    vi.clearAllMocks();
  });

  it("restores the saved profile and companion for the same account", async () => {
    const profile = {
      nickname: "阿澜",
      existingSkills: "我会游泳，会唱歌",
      highlightMoment: "完成了第一个半马",
      potentialDirection: "学跳舞",
      registeredAt: "2026.6.23",
      skills: ["游泳", "唱歌"],
      highlights: ["完成了第一个半马"],
      growthTrajectory: [],
      shelangCount: 0,
      completedCount: 0,
      completionRate: 0,
      portraitLine: "一个刚来到岸边，准备写下第一页的人。",
    };

    mockedApi.login.mockResolvedValueOnce({ ok: true, account: buildAccount({ loginName: "阿澜" }) });
    mockedApi.updatePet.mockResolvedValueOnce({
      ok: true,
      account: buildAccount({ loginName: "阿澜", selectedPetId: "cloud-tiger" }),
    });
    mockedApi.createProfile.mockResolvedValueOnce({
      ok: true,
      profile,
      account: buildAccount({ loginName: "阿澜", selectedPetId: "cloud-tiger", profile }),
    });
    mockedApi.login.mockResolvedValueOnce({
      ok: true,
      account: buildAccount({ loginName: "阿澜", selectedPetId: "cloud-tiger", profile }),
    });

    await useSessionStore.getState().login("阿澜", "1234");
    await useSessionStore.getState().selectPet("cloud-tiger");
    await useSessionStore.getState().createProfile(
      "阿澜",
      "我会游泳，会唱歌",
      "完成了第一个半马",
      "学跳舞",
    );

    useSessionStore.getState().logout();
    await useSessionStore.getState().login("阿澜", "1234");

    const restoredState = useSessionStore.getState();

    expect(restoredState.selectedPetId).toBe("cloud-tiger");
    expect(restoredState.profile?.nickname).toBe("阿澜");
    expect(restoredState.profile?.existingSkills).toBe("我会游泳，会唱歌");
    expect(restoredState.profile?.highlightMoment).toBe("完成了第一个半马");
    expect(restoredState.profile?.potentialDirection).toBe("学跳舞");
  });

  it("register creates a new account and logs in", async () => {
    mockedApi.register.mockResolvedValueOnce({
      ok: true,
      account: buildAccount({ loginName: "新旅人", hasPassword: true }),
    });

    await useSessionStore.getState().register("新旅人", "abcd");

    const state = useSessionStore.getState();
    expect(state.isLoggedIn).toBe(true);
    expect(state.loginName).toBe("新旅人");
    expect(mockedApi.register).toHaveBeenCalledWith("新旅人", "abcd", "moon-rabbit");
  });

  it("autoRegister stores the generated password", async () => {
    mockedApi.autoRegister.mockResolvedValueOnce({
      ok: true,
      account: buildAccount({ loginName: "旅人1234", hasPassword: true }),
      generatedPassword: "a1b2c3d4",
    });

    const password = await useSessionStore.getState().autoRegister();

    const state = useSessionStore.getState();
    expect(password).toBe("a1b2c3d4");
    expect(state.isLoggedIn).toBe(true);
    expect(state.loginName).toBe("旅人1234");
    expect(state.lastAutoPassword).toBe("a1b2c3d4");
  });

  it("clearAutoPassword resets the stored password", async () => {
    mockedApi.autoRegister.mockResolvedValueOnce({
      ok: true,
      account: buildAccount({ loginName: "旅人5678" }),
      generatedPassword: "pass1234",
    });

    await useSessionStore.getState().autoRegister();
    expect(useSessionStore.getState().lastAutoPassword).toBe("pass1234");

    useSessionStore.getState().clearAutoPassword();
    expect(useSessionStore.getState().lastAutoPassword).toBe("");
  });
});

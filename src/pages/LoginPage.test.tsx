import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/pages/LoginPage";
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

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

function buildAccount(overrides: Partial<{
  loginName: string;
  selectedPetId: PetId;
  hasPassword: boolean;
}> = {}): BackendAccount {
  return {
    loginName: overrides.loginName ?? "阿澜",
    selectedPetId: overrides.selectedPetId ?? "moon-rabbit",
    profile: null,
    journeys: [],
    hasPassword: overrides.hasPassword ?? true,
    updatedAt: new Date().toISOString(),
  };
}

describe("LoginPage", () => {
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

  it("renders the waveward landing experience", () => {
    renderLoginPage();

    expect(screen.getByRole("heading", { name: "涉浪" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /登录涉浪/i })).toBeInTheDocument();
    expect(screen.getByText("今日同行伙伴")).toBeInTheDocument();
  });

  it("switches between login, register and auto tabs", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "注册" }));
    expect(screen.getByPlaceholderText("再次输入密码")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "一键体验" }));
    expect(screen.getByText(/系统会为你随机生成一个账号和密码/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "登录" }));
    expect(screen.queryByPlaceholderText("再次输入密码")).not.toBeInTheDocument();
  });

  it("updates companion selection and logs in", async () => {
    const user = userEvent.setup();
    mockedApi.login.mockResolvedValueOnce({
      ok: true,
      account: buildAccount({ loginName: "阿澜", selectedPetId: "cloud-tiger" }),
    });

    renderLoginPage();

    await user.click(screen.getByRole("button", { name: /破云/i }));
    expect(screen.getByText("会替你鼓劲也会骂醒你的虎")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("2 个字符以上的账号名"), "阿澜");
    await user.type(screen.getByPlaceholderText("请输入密码"), "1234");
    await user.click(screen.getByRole("button", { name: /登录涉浪/i }));

    expect(useSessionStore.getState().selectedPetId).toBe("cloud-tiger");
    expect(useSessionStore.getState().isLoggedIn).toBe(true);
    expect(useSessionStore.getState().loginName).toBe("阿澜");
  });

  it("registers a new account via the register tab", async () => {
    const user = userEvent.setup();
    mockedApi.register.mockResolvedValueOnce({
      ok: true,
      account: buildAccount({ loginName: "新旅人", selectedPetId: "moon-rabbit" }),
    });

    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "注册" }));
    await user.type(screen.getByPlaceholderText("2 个字符以上的账号名"), "新旅人");
    await user.type(screen.getByPlaceholderText("至少 4 个字符"), "abcd");
    await user.type(screen.getByPlaceholderText("再次输入密码"), "abcd");
    await user.click(screen.getByRole("button", { name: /注册并进入/i }));

    expect(mockedApi.register).toHaveBeenCalledWith("新旅人", "abcd", "moon-rabbit");
    expect(useSessionStore.getState().isLoggedIn).toBe(true);
    expect(useSessionStore.getState().loginName).toBe("新旅人");
  });

  it("auto-registers an account with one click", async () => {
    const user = userEvent.setup();
    mockedApi.autoRegister.mockResolvedValueOnce({
      ok: true,
      account: buildAccount({ loginName: "旅人1234", selectedPetId: "moon-rabbit" }),
      generatedPassword: "a1b2c3d4",
    });

    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "一键体验" }));
    await user.click(screen.getByRole("button", { name: /一键自动注册/i }));

    expect(mockedApi.autoRegister).toHaveBeenCalledWith("moon-rabbit");
    expect(useSessionStore.getState().isLoggedIn).toBe(true);
    expect(useSessionStore.getState().loginName).toBe("旅人1234");
    expect(useSessionStore.getState().lastAutoPassword).toBe("a1b2c3d4");
  });

  it("shows an error when passwords do not match during registration", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "注册" }));
    await user.type(screen.getByPlaceholderText("2 个字符以上的账号名"), "新旅人");
    await user.type(screen.getByPlaceholderText("至少 4 个字符"), "abcd");
    await user.type(screen.getByPlaceholderText("再次输入密码"), "different");
    await user.click(screen.getByRole("button", { name: /注册并进入/i }));

    expect(screen.getByText("两次输入的密码不一致。")).toBeInTheDocument();
    expect(mockedApi.register).not.toHaveBeenCalled();
  });
});

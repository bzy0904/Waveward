import type {
  AnswerRecord,
  JourneyEntry,
  PersonaType,
  PetId,
  QuestionItem,
  ReportResult,
  UserProfile,
} from "@/types/session";

const API_BASE_URL = "/api";

export type BackendAccount = {
  loginName: string;
  selectedPetId: PetId;
  profile: UserProfile | null;
  journeys: JourneyEntry[];
  hasPassword: boolean;
  updatedAt: string;
};

export type BackendSession = {
  id: number;
  loginName: string;
  topic: string;
  persona: PersonaType;
  petId: PetId;
  profileSnapshot: UserProfile | null;
  answers: AnswerRecord[];
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  ok: boolean;
  error?: string;
} & T;

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "请求失败");
  }

  return data;
}

export const wavewardApi = {
  health: () => request<{ service: string; timestamp: string }>("/health"),
  register: (loginName: string, password: string, petId: PetId) =>
    request<{ account: BackendAccount }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ loginName, password, petId }),
    }),
  login: (loginName: string, password: string, petId: PetId) =>
    request<{ account: BackendAccount }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ loginName, password, petId }),
    }),
  autoRegister: (petId: PetId) =>
    request<{ account: BackendAccount; generatedPassword: string }>("/auth/auto-register", {
      method: "POST",
      body: JSON.stringify({ petId }),
    }),
  getAccount: (loginName: string) =>
    request<{ account: BackendAccount }>(`/accounts/${encodeURIComponent(loginName)}`),
  updatePet: (loginName: string, petId: PetId) =>
    request<{ account: BackendAccount }>(`/accounts/${encodeURIComponent(loginName)}/pet`, {
      method: "POST",
      body: JSON.stringify({ petId }),
    }),
  createProfile: (payload: {
    loginName: string;
    nickname: string;
    existingSkills: string;
    highlightMoment: string;
    potentialDirection: string;
    petId: PetId;
  }) =>
    request<{ profile: UserProfile; account: BackendAccount }>("/profiles", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createSession: (payload: {
    loginName: string;
    topic: string;
    persona: PersonaType;
    petId: PetId;
  }) =>
    request<{ session: BackendSession; account: BackendAccount }>("/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getSession: (sessionId: number) => request<{ session: BackendSession }>(`/sessions/${sessionId}`),
  fetchAiQuestion: (sessionId: number) =>
    request<{ question: QuestionItem | null; step: number; total: number }>(
      `/sessions/${sessionId}/questions`,
    ),
  submitAnswer: (sessionId: number, answer: AnswerRecord) =>
    request<{ answerCount: number; session: BackendSession; nextQuestion: QuestionItem | null }>(
      `/sessions/${sessionId}/answers`,
      {
        method: "POST",
        body: JSON.stringify(answer),
      },
    ),
  generateReport: (sessionId: number) =>
    request<{ report: ReportResult; journey: JourneyEntry; account: BackendAccount }>(
      `/sessions/${sessionId}/report`,
      {
        method: "POST",
      },
    ),
  completeJourney: (journeyId: string, loginName: string, reflection?: string) =>
    request<{ journey: JourneyEntry; account: BackendAccount }>(`/journeys/${journeyId}/complete`, {
      method: "POST",
      body: JSON.stringify({ loginName, reflection }),
    }),
  addFollowUp: (journeyId: string, loginName: string, content: string) =>
    request<{ journey: JourneyEntry; account: BackendAccount }>(`/journeys/${journeyId}/followups`, {
      method: "POST",
      body: JSON.stringify({ loginName, content }),
    }),
};

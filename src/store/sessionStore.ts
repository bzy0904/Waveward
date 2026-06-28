import { create } from "zustand";
import { persist } from "zustand/middleware";
import { companionPetMap, defaultPetId } from "@/data/demoContent";
import { wavewardApi, type BackendAccount } from "@/services/wavewardApi";
import type {
  AnswerRecord,
  AnswerStance,
  JourneyEntry,
  PersonaType,
  PetId,
  QuestionDimension,
  QuestionItem,
  ReportResult,
  UserProfile,
} from "@/types/session";

type AccountArchive = {
  selectedPetId: PetId;
  profile: UserProfile | null;
  journeys: JourneyEntry[];
};

type SessionState = {
  isLoggedIn: boolean;
  loginName: string;
  topic: string;
  persona: PersonaType;
  selectedPetId: PetId;
  profile: UserProfile | null;
  journeys: JourneyEntry[];
  currentStep: number;
  currentSessionId: number;
  answers: AnswerRecord[];
  currentReport: ReportResult | null;
  accountArchives: Record<string, AccountArchive>;
  lastAutoPassword: string;
  login: (loginName: string, password: string) => Promise<void>;
  register: (loginName: string, password: string) => Promise<void>;
  autoRegister: () => Promise<string>;
  logout: () => void;
  clearAutoPassword: () => void;
  setTopic: (topic: string) => void;
  selectPet: (petId: PetId) => Promise<void>;
  createProfile: (
    nickname: string,
    existingSkills: string,
    highlightMoment: string,
    potentialDirection: string,
    petId?: PetId,
  ) => Promise<void>;
  startSession: (topic: string) => Promise<void>;
  submitAnswer: (
    questionId: string,
    dimension: QuestionDimension,
    title: string,
    prompt: string,
    comparisonTarget: string | undefined,
    value: string,
    trend: AnswerRecord["trend"],
    stance: AnswerStance,
  ) => Promise<QuestionItem | null>;
  syncReport: (report?: ReportResult) => Promise<JourneyEntry | null>;
  completeJourney: (journeyId: string, reflection?: string) => Promise<JourneyEntry | null>;
  addFollowUp: (journeyId: string, content: string) => Promise<JourneyEntry | null>;
  resetSession: () => void;
};

const fallbackLoginName = "旅人";

const initialState = {
  isLoggedIn: false,
  loginName: "",
  topic: "",
  persona: companionPetMap[defaultPetId].basePersona as PersonaType,
  selectedPetId: defaultPetId,
  profile: null as UserProfile | null,
  journeys: [] as JourneyEntry[],
  currentStep: 0,
  currentSessionId: 0,
  answers: [] as AnswerRecord[],
  currentReport: null as ReportResult | null,
  accountArchives: {} as Record<string, AccountArchive>,
  lastAutoPassword: "",
};

function normalizeLoginName(loginName: string) {
  return loginName.trim() || fallbackLoginName;
}

function buildAccountArchive(
  selectedPetId: PetId,
  profile: UserProfile | null,
  journeys: JourneyEntry[],
): AccountArchive {
  return {
    selectedPetId,
    profile,
    journeys,
  };
}

function syncAccountArchiveFromAccount(
  archives: Record<string, AccountArchive>,
  account: BackendAccount,
): Record<string, AccountArchive> {
  return {
    ...archives,
    [account.loginName]: buildAccountArchive(
      account.selectedPetId,
      account.profile,
      account.journeys,
    ),
  };
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      ...initialState,
      login: async (loginName, password) => {
        const state = get();
        const normalizedLoginName = normalizeLoginName(loginName);
        const requestedPetId = state.selectedPetId ?? defaultPetId;
        const { account } = await wavewardApi.login(normalizedLoginName, password, requestedPetId);

        set((current) => ({
          ...initialState,
          accountArchives: syncAccountArchiveFromAccount(current.accountArchives, account),
          isLoggedIn: true,
          loginName: account.loginName,
          selectedPetId: account.selectedPetId,
          persona: companionPetMap[account.selectedPetId].basePersona,
          profile: account.profile,
          journeys: account.journeys,
        }));
      },
      register: async (loginName, password) => {
        const state = get();
        const normalizedLoginName = normalizeLoginName(loginName);
        const requestedPetId = state.selectedPetId ?? defaultPetId;
        const { account } = await wavewardApi.register(
          normalizedLoginName,
          password,
          requestedPetId,
        );

        set((current) => ({
          ...initialState,
          accountArchives: syncAccountArchiveFromAccount(current.accountArchives, account),
          isLoggedIn: true,
          loginName: account.loginName,
          selectedPetId: account.selectedPetId,
          persona: companionPetMap[account.selectedPetId].basePersona,
          profile: account.profile,
          journeys: account.journeys,
        }));
      },
      autoRegister: async () => {
        const state = get();
        const requestedPetId = state.selectedPetId ?? defaultPetId;
        const { account, generatedPassword } = await wavewardApi.autoRegister(requestedPetId);

        set((current) => ({
          ...initialState,
          accountArchives: syncAccountArchiveFromAccount(current.accountArchives, account),
          isLoggedIn: true,
          loginName: account.loginName,
          selectedPetId: account.selectedPetId,
          persona: companionPetMap[account.selectedPetId].basePersona,
          profile: account.profile,
          journeys: account.journeys,
          lastAutoPassword: generatedPassword,
        }));

        return generatedPassword;
      },
      logout: () =>
        set((state) => ({
          ...initialState,
          accountArchives: state.accountArchives,
          selectedPetId: defaultPetId,
          persona: companionPetMap[defaultPetId].basePersona,
        })),
      clearAutoPassword: () => set({ lastAutoPassword: "" }),
      setTopic: (topic) => set({ topic }),
      selectPet: async (petId) => {
        const state = get();

        if (!state.isLoggedIn || !state.loginName) {
          set((current) => ({
            selectedPetId: petId,
            persona: companionPetMap[petId].basePersona,
            accountArchives: current.loginName
              ? {
                  ...current.accountArchives,
                  [current.loginName]: buildAccountArchive(
                    petId,
                    current.profile,
                    current.journeys,
                  ),
                }
              : current.accountArchives,
          }));
          return;
        }

        const { account } = await wavewardApi.updatePet(state.loginName, petId);

        set((current) => ({
          selectedPetId: account.selectedPetId,
          persona: companionPetMap[account.selectedPetId].basePersona,
          profile: account.profile,
          journeys: account.journeys,
          accountArchives: syncAccountArchiveFromAccount(current.accountArchives, account),
        }));
      },
      createProfile: async (nickname, existingSkills, highlightMoment, potentialDirection, petId) => {
        const state = get();
        const nextPetId = petId ?? state.selectedPetId;
        const { account } = await wavewardApi.createProfile({
          loginName: state.loginName || fallbackLoginName,
          nickname,
          existingSkills,
          highlightMoment,
          potentialDirection,
          petId: nextPetId,
        });

        set((current) => ({
          selectedPetId: account.selectedPetId,
          persona: companionPetMap[account.selectedPetId].basePersona,
          profile: account.profile,
          journeys: account.journeys,
          accountArchives: syncAccountArchiveFromAccount(current.accountArchives, account),
        }));
      },
      startSession: async (topic) => {
        const state = get();
        const { session } = await wavewardApi.createSession({
          loginName: state.loginName || fallbackLoginName,
          topic: topic.trim(),
          persona: companionPetMap[state.selectedPetId].basePersona,
          petId: state.selectedPetId,
        });

        set({
          topic: session.topic,
          persona: session.persona,
          currentStep: session.answers.length,
          currentSessionId: session.id,
          answers: session.answers,
          currentReport: null,
        });
      },
      submitAnswer: async (
        questionId,
        dimension,
        title,
        prompt,
        comparisonTarget,
        value,
        trend,
        stance,
      ) => {
        const state = get();

        if (!state.currentSessionId) return null;

        const { session, nextQuestion } = await wavewardApi.submitAnswer(state.currentSessionId, {
          questionId,
          dimension,
          title,
          prompt,
          comparisonTarget,
          value,
          trend,
          stance,
        });

        set({
          answers: session.answers,
          currentStep: session.answers.length,
        });

        return nextQuestion;
      },
      syncReport: async (report) => {
        const state = get();

        if (!state.currentSessionId) {
          return null;
        }

        const { report: nextReport, journey, account } = await wavewardApi.generateReport(
          state.currentSessionId,
        );

        set((current) => ({
          currentReport: nextReport ?? report ?? null,
          selectedPetId: account.selectedPetId,
          persona: companionPetMap[account.selectedPetId].basePersona,
          profile: account.profile,
          journeys: account.journeys,
          accountArchives: syncAccountArchiveFromAccount(current.accountArchives, account),
        }));

        return journey;
      },
      completeJourney: async (journeyId, reflection = "") => {
        const state = get();

        if (!state.loginName) return null;

        const { journey, account } = await wavewardApi.completeJourney(
          journeyId,
          state.loginName,
          reflection,
        );

        set((current) => ({
          selectedPetId: account.selectedPetId,
          persona: companionPetMap[account.selectedPetId].basePersona,
          profile: account.profile,
          journeys: account.journeys,
          accountArchives: syncAccountArchiveFromAccount(current.accountArchives, account),
        }));

        return journey;
      },
      addFollowUp: async (journeyId, content) => {
        const state = get();

        if (!state.loginName) return null;

        const { journey, account } = await wavewardApi.addFollowUp(
          journeyId,
          state.loginName,
          content,
        );

        set((current) => ({
          journeys: account.journeys,
          accountArchives: syncAccountArchiveFromAccount(current.accountArchives, account),
        }));

        return journey;
      },
      resetSession: () =>
        set((state) => ({
          ...initialState,
          isLoggedIn: state.isLoggedIn,
          loginName: state.loginName,
          selectedPetId: state.selectedPetId,
          profile: state.profile,
          journeys: state.journeys,
          persona: companionPetMap[state.selectedPetId].basePersona,
          accountArchives: state.accountArchives,
        })),
    }),
    {
      name: "shelang-session-store-v2",
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        loginName: state.loginName,
        selectedPetId: state.selectedPetId,
        profile: state.profile,
        journeys: state.journeys,
        accountArchives: state.accountArchives,
      }),
    },
  ),
);

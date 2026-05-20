import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  BudgetSetBundle,
  OnboardingPersonaScores,
  fetchBudgetSets,
  fetchOnboardingPersonaScores,
  fetchPersonalizedSearchResults,
  fetchRecommendations,
  selectOnboardingPersona,
} from "./api";

type SearchMode = "text" | "image" | "multimodal";
type SearchResultView = "similarity" | "personalized";

type SearchResult = {
  id: number;
  title: string;
  brand: string;
  price: string;
  similarity: number;
  searchType: string;
  responseTime: string;
  summary: string;
  accent: string;
  imageUrl?: string;
};

type UploadedImage = {
  name: string;
  sizeLabel: string;
  base64: string;
};

type PersonaOption = {
  key: string;
  name: string;
  title: string;
  summary: string;
  traits: string[];
};


const personaOptions: PersonaOption[] = [
  {
    key: "trendsetter",
    name: "트렌드세터형",
    title: "새로운 스타일을 빠르게 시도해요",
    summary: "유행과 변화에 민감하고 다양한 룩을 탐색하는 성향입니다.",
    traits: ["유행 민감", "실험적", "빠른 반응"],
  },
  {
    key: "practical",
    name: "실용주의형",
    title: "착용감과 활용도를 중요하게 봐요",
    summary: "오래 입기 좋고 다양한 상황에 맞는 아이템을 선호합니다.",
    traits: ["실용성", "기본 아이템", "활용도"],
  },
  {
    key: "value",
    name: "가성비추구형",
    title: "가격 대비 만족도를 중요하게 봐요",
    summary: "할인과 가격 메리트를 함께 고려하는 성향입니다.",
    traits: ["가격 민감", "할인 선호", "비교 구매"],
  },
  {
    key: "brand_loyal",
    name: "브랜드충성형",
    title: "익숙한 브랜드를 꾸준히 선택해요",
    summary: "기존 만족 경험이 있는 브랜드와 카테고리를 반복 탐색합니다.",
    traits: ["브랜드 선호", "재구매", "안정적 취향"],
  },
  {
    key: "impulse",
    name: "충동구매형",
    title: "마음에 들면 빠르게 결정해요",
    summary: "즉각적인 매력과 인상적인 디테일에 민감하게 반응합니다.",
    traits: ["빠른 결정", "즉흥성", "시각 반응"],
  },
  {
    key: "careful",
    name: "신중탐색형",
    title: "여러 옵션을 오래 비교해요",
    summary: "리뷰, 소재, 가격을 충분히 비교한 뒤 결정하는 성향입니다.",
    traits: ["비교 탐색", "정보 수집", "신중한 결정"],
  },
  {
    key: "repeat_stable",
    name: "반복구매형",
    title: "비슷한 상품을 꾸준히 다시 찾아요",
    summary: "익숙한 카테고리와 검증된 아이템을 반복 구매하는 성향입니다.",
    traits: ["재구매", "안정성", "반복 선택"],
  },
  {
    key: "color_focus",
    name: "색상집중형",
    title: "선호하는 색감을 중심으로 봐요",
    summary: "특정 컬러 계열을 우선해서 탐색하는 경향이 강합니다.",
    traits: ["컬러 우선", "톤 선호", "시각 취향"],
  },
  {
    key: "category_focus",
    name: "카테고리집중형",
    title: "원하는 카테고리를 깊게 파고들어요",
    summary: "특정 카테고리 안에서 다양한 옵션을 오래 비교합니다.",
    traits: ["카테고리 몰입", "깊은 비교", "명확한 관심사"],
  },
];

const onboardingStyleOptions = ["casual", "minimal", "street", "sporty", "feminine", "classic"];

const emptyBudgetSetBundle: BudgetSetBundle = {
  budget: 0,
  setCount: 0,
  sets: [],
};

function ResultVisual({
  imageUrl,
  title,
  accent,
}: {
  imageUrl?: string;
  title: string;
  accent: string;
}) {
  return (
    <div className="result-visual" style={{ background: accent }}>
      {imageUrl ? <img className="result-image" src={imageUrl} alt={title} loading="lazy" /> : null}
    </div>
  );
}

function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedOnboardingPersona, setSelectedOnboardingPersona] = useState("trendsetter");
  const [query, setQuery] = useState("광택감 있는 블랙 아우터와 실버 포인트 자켓");
  const [userId, setUserId] = useState("user_1024");
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>("multimodal");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [personalizedResults, setPersonalizedResults] = useState<SearchResult[]>([]);
  const [activeLatency, setActiveLatency] = useState("0ms");
  const [personalizedLatency, setPersonalizedLatency] = useState("0ms");
  const [searchResultView, setSearchResultView] = useState<SearchResultView>("similarity");
  const [searchResultPersona, setSearchResultPersona] = useState("개인화 검색");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recommendationWeight, setRecommendationWeight] = useState(0.7);
  const [isRefreshingRecommendations, setIsRefreshingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const [topN, setTopN] = useState(5);
  const [budget, setBudget] = useState("200000");
  const [budgetSets, setBudgetSets] = useState<BudgetSetBundle>(emptyBudgetSetBundle);
  const [isLoadingBudgetSets, setIsLoadingBudgetSets] = useState(false);
  const [budgetSetError, setBudgetSetError] = useState<string | null>(null);

  const [onboardingDescription, setOnboardingDescription] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["minimal"]);
  const [personaScores, setPersonaScores] = useState<OnboardingPersonaScores>({});
  const [isAnalyzingOnboarding, setIsAnalyzingOnboarding] = useState(false);
  const [isSubmittingPersona, setIsSubmittingPersona] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const isManagingHistoryRef = useRef(false);

  const budgetLabel = `${Number(budget || 0).toLocaleString("ko-KR")}원`;

  const helperMessage = useMemo(() => {
    if (searchMode === "text") {
      return "텍스트 질의만으로 유사 상품을 찾습니다.";
    }
    if (searchMode === "image") {
      return "업로드 이미지 특징을 기반으로 시각적으로 비슷한 상품을 찾습니다.";
    }
    return "텍스트와 이미지 신호를 함께 반영해 더 강한 후보를 우선 정렬합니다.";
  }, [searchMode]);

  useEffect(() => {
    setPersonaScores({});
    setOnboardingError(null);
  }, [onboardingDescription, selectedStyles]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const nextView = event.state?.view;

      if (showOnboarding && nextView !== "onboarding") {
        isManagingHistoryRef.current = true;
        setShowOnboarding(false);
        isManagingHistoryRef.current = false;
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showOnboarding]);

  useEffect(() => {
    if (!isRegistered || isManagingHistoryRef.current) {
      return;
    }

    const currentView = window.history.state?.view;

    if (showOnboarding && currentView !== "onboarding") {
      window.history.pushState({ view: "onboarding" }, "");
      return;
    }

    if (!showOnboarding && currentView === "onboarding") {
      window.history.replaceState({ view: "main" }, "");
    }
  }, [isRegistered, showOnboarding]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setUploadedImage(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const [, base64 = ""] = result.split(",");
      const sizeInMb = file.size / (1024 * 1024);

      setUploadedImage({
        name: file.name,
        sizeLabel: `${sizeInMb.toFixed(2)}MB`,
        base64,
      });

      setSearchMode((currentMode) => (currentMode === "text" ? "multimodal" : currentMode));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();
    const nextMode: SearchMode =
      trimmedQuery && uploadedImage ? "multimodal" : uploadedImage ? "image" : "text";

    setSearchMode(nextMode);
    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);
    setSearchResultView("personalized");

    try {
      const response = await fetchPersonalizedSearchResults({
        userId: userId.trim() || "anonymous",
        query: trimmedQuery,
        imageBase64: uploadedImage?.base64 ?? null,
        topK: 80,
        topN,
        mode: nextMode,
        personaHint: selectedOnboardingPersona,
      });

      if (response.similarity.items.length > 0) {
        setResults(response.similarity.items);
      } else {
        setResults([]);
      }
      setActiveLatency(response.similarity.responseTime);

      setPersonalizedResults(response.personalized.items);
      setPersonalizedLatency(response.personalized.responseTime);
      setSearchResultPersona(response.personalized.persona);

    } catch (error) {
      setResults([]);
      setActiveLatency("0ms");
      setPersonalizedResults([]);
      setPersonalizedLatency("0ms");
      setSearchResultPersona("개인화 검색");
      setSearchResultView("personalized");
      setSearchError(error instanceof Error ? error.message : "검색 결과를 불러오지 못했습니다.");
    } finally {
      setIsSearching(false);
    }
  };


  const toggleStyleChoice = (style: string) => {
    setSelectedStyles((current) =>
      current.includes(style) ? current.filter((value) => value !== style) : [...current, style],
    );
  };

  const updatePersonaScore = (personaKey: string, nextValue: number) => {
    setPersonaScores((current) => {
      const clampedValue = Math.max(0, Math.min(100, Math.round(nextValue)));
      const nextScores = {
        ...current,
        [personaKey]: clampedValue,
      };
      const total = Object.values(nextScores).reduce((sum, value) => sum + value, 0);
      if (total > 100) {
        return current;
      }
      const topPersona = Object.entries(nextScores).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topPersona) {
        setSelectedOnboardingPersona(topPersona);
      }
      return nextScores;
    });
  };

  const handleSignUp = () => {
    if (!userId.trim()) {
      return;
    }

    setIsRegistered(true);
    setShowOnboarding(true);
  };

  const runOnboardingAnalysis = async () => {
    if (!userId.trim() || !onboardingDescription.trim()) {
      setOnboardingError("사용자 ID와 취향 설명을 입력해 주세요.");
      return;
    }

    setIsAnalyzingOnboarding(true);
    setOnboardingError(null);

    try {
      const scores = await fetchOnboardingPersonaScores({
        userId: userId.trim(),
        description: onboardingDescription.trim(),
        styleChoices: selectedStyles,
        budgetRange: null,
      });

      setPersonaScores(scores);
      const topPersona = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topPersona) {
        setSelectedOnboardingPersona(topPersona);
      }
    } catch {
      setOnboardingError("페르소나 분석에 실패했습니다. 백엔드 설정을 확인해 주세요.");
    } finally {
      setIsAnalyzingOnboarding(false);
    }
  };

  const loadBudgetSets = async () => {
    const parsedBudget = Number(budget);
    if (!userId.trim() || !Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      setBudgetSetError("유효한 사용자 ID와 예산을 입력해 주세요.");
      return;
    }

    setIsLoadingBudgetSets(true);
    setBudgetSetError(null);

    try {
      const bundle = await fetchBudgetSets({
        userId: userId.trim(),
        budget: parsedBudget,
        setCount: 3,
      });
      setBudgetSets(bundle);
    } catch {
      setBudgetSetError("예산 세트 추천 결과를 불러오지 못했습니다.");
      setBudgetSets(emptyBudgetSetBundle);
    } finally {
      setIsLoadingBudgetSets(false);
    }
  };

  const loadAiRecommendations = async () => {
    if (!userId.trim()) {
      setRecommendationError("사용자 정보를 먼저 설정해 주세요.");
      return;
    }

    setIsRefreshingRecommendations(true);
    setRecommendationError(null);

    try {
      const bundle = await fetchRecommendations(userId.trim(), topN, Date.now(), {
        personaHint: selectedOnboardingPersona,
        personalizationWeight: recommendationWeight,
        includeReasons: true,
      });

      const mappedResults: SearchResult[] = bundle.items.map((item) => ({
        id: item.id,
        title: item.title,
        brand: item.brand,
        price: item.price,
        similarity: item.score,
        searchType: "AI 추천",
        responseTime: bundle.totalLatency,
        summary: item.reason,
        accent: item.accent,
        imageUrl: item.imageUrl,
      }));

      setPersonalizedResults(mappedResults);
      setPersonalizedLatency(bundle.totalLatency);
      setSearchResultPersona(bundle.persona);
      setSearchResultView("personalized");
      setHasSearched(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "AI 추천 결과를 불러오지 못했습니다.";
      setRecommendationError(message);
    } finally {
      setIsRefreshingRecommendations(false);
    }
  };

  const startWithPersona = async () => {
    setIsSubmittingPersona(true);
    setOnboardingError(null);

    try {
      await selectOnboardingPersona({
        userId: userId.trim() || "anonymous",
        persona: selectedOnboardingPersona,
        personaScores,
      });
      setShowOnboarding(false);
      setBudgetSets(emptyBudgetSetBundle);
    } catch {
      setOnboardingError("선택한 페르소나를 저장하지 못했습니다.");
    } finally {
      setIsSubmittingPersona(false);
    }
  };

  const modeLabel =
    searchMode === "multimodal" ? "멀티모달" : searchMode === "image" ? "이미지" : "텍스트";
  const rankedPersonas = personaOptions
    .filter((persona) => (personaScores[persona.key] ?? 0) > 0)
    .sort((left, right) => (personaScores[right.key] ?? 0) - (personaScores[left.key] ?? 0));
  const personaScoreTotal = Object.values(personaScores).reduce((sum, value) => sum + value, 0);
  const isPersonaScoreTotalValid = personaScoreTotal === 100;
  const hasPersonalizedSearchResults = hasSearched && personalizedResults.length > 0;
  const activeSearchResults = searchResultView === "personalized" ? personalizedResults : results;
  const activeSearchLatency = searchResultView === "personalized" ? personalizedLatency : activeLatency;
  const activeSearchScoreLabel = searchResultView === "personalized" ? "추천 점수" : "유사도";
  const mergedSearchResults = hasPersonalizedSearchResults ? personalizedResults : activeSearchResults;
  const mergedSearchLatency = hasPersonalizedSearchResults ? personalizedLatency : activeSearchLatency;
  const mergedSearchScoreLabel = hasPersonalizedSearchResults ? "추천 점수" : activeSearchScoreLabel;
  const searchEmptyMessage = !hasSearched
    ? "검색을 실행하면 유사도순 결과와 내 취향순 결과가 여기에 표시됩니다."
    : searchError
      ? searchError
      : searchResultView === "personalized"
        ? "검색 후보 안에서 개인화된 결과가 아직 없습니다. 검색을 다시 시도해 주세요."
        : "검색 결과가 없습니다. 검색어를 조금 더 구체적으로 바꿔 보세요.";

  if (showOnboarding) {
    return (
      <div className="app-shell onboarding-shell">
        <section className="onboarding-panel">
          <div className="onboarding-copy">
            <p className="eyebrow">Personalization Setup</p>
            <h1>먼저 취향을 알려주시면 추천을 바로 맞춰드립니다.</h1>
            <p>
              취향 설명과 스타일 선택을 바탕으로 페르소나를 분석하고, 결과를 확정하면
              개인화 추천에 즉시 반영됩니다.
            </p>
          </div>

          <div className="search-composer">
            <label className="search-box">
              <span>취향 설명</span>
              <input
                value={onboardingDescription}
                onChange={(event) => setOnboardingDescription(event.target.value)}
                placeholder="예: 미니멀한 블랙 아우터와 실용적인 출근룩을 자주 봅니다"
                aria-label="온보딩 취향 설명"
              />
            </label>

            <div className="signal-list">
              {onboardingStyleOptions.map((style) => (
                <button
                  key={style}
                  type="button"
                  className={selectedStyles.includes(style) ? "mini-button active" : "mini-button"}
                  onClick={() => toggleStyleChoice(style)}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="recommendation-toolbar">
              <button
                type="button"
                className="primary-button"
                onClick={runOnboardingAnalysis}
                disabled={isAnalyzingOnboarding}
              >
                {isAnalyzingOnboarding ? "분석 중..." : "취향 분석하기"}
              </button>
            </div>
          </div>

          {rankedPersonas.length > 0 ? (
            <div className="persona-grid">
              {rankedPersonas.map((persona) => (
                <article
                  key={persona.key}
                  className={
                    persona.key === selectedOnboardingPersona ? "persona-option active" : "persona-option"
                  }
                >
                  <p className="persona-name">{persona.name}</p>
                  <h2>{persona.title}</h2>
                  <p className="persona-summary">{persona.summary}</p>
                  <div className="persona-score-row">
                    <strong>{personaScores[persona.key] ?? 0}%</strong>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={personaScores[persona.key] ?? 0}
                      onChange={(event) => updatePersonaScore(persona.key, Number(event.target.value))}
                      aria-label={`${persona.name} 비율 조절`}
                    />
                  </div>
                  <div className="persona-traits">
                    {persona.traits.map((trait) => (
                      <span key={trait} className="badge">
                        {trait}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          <div className="onboarding-footer">
            <div className="persona-card">
              <span>?? ??</span>
              <strong>{personaScoreTotal}%</strong>
            </div>
            <button
              type="button"
              className="primary-button"
              onClick={startWithPersona}
              disabled={
                isSubmittingPersona || Object.keys(personaScores).length === 0 || !isPersonaScoreTotalValid
              }
            >
              {isSubmittingPersona ? "?? ?..." : "? ???? ?? ??"}
            </button>
          </div>
          {rankedPersonas.length > 0 ? (
            <p className="persona-adjustment-note">
              ????? ?? ?????. ????? ??? ?? ??? ???.
              {!isPersonaScoreTotalValid ? " ??? 100%? ??? ?? ??? ??? ? ????." : ""}
            </p>
          ) : null}
          {onboardingError ? <p className="status-text">{onboardingError}</p> : null}
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Fit-Find</p>
          <h1>Fit-Find: 취향 기반 멀티모달·멀티스테이지 패션 검색 및 추천</h1>
        </div>
      </header>

      <main className="layout">
        <section className="panel signup-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">User Setup</p>
              <h3>사용자 정보 설정</h3>
            </div>
          </div>
          <div className="signup-row">
            <label className="user-id-field">
              <span>User ID</span>
              <input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="예: user_1024"
                aria-label="회원가입 사용자 ID"
              />
            </label>
            <button
              type="button"
              className="primary-button"
              onClick={handleSignUp}
              disabled={!userId.trim() || isRegistered}
            >
              {isRegistered ? "설정 완료" : "설정 시작"}
            </button>
          </div>
          <p className="status-text signup-text">
            사용자 정보를 설정한 뒤 취향 분석을 진행하면 초기 추천에 바로 반영됩니다.
          </p>
        </section>

        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Search Experience</p>
            <h2>검색 화면</h2>
            <p className="hero-description">
              검색어와 이미지를 함께 입력하면 상황에 맞는 검색 방식을 자동으로 적용하고,
              결과 카드에는 유사도와 응답 시간을 함께 보여줍니다.
            </p>

            <div className="panel weight-panel">
              <div className="weight-copy">
                <p className="eyebrow">Result Balance</p>
                <h4>개인화와 유사도 비중 조절</h4>
                <p>
                  개인화 {Math.round(recommendationWeight * 100)}% · 유사도{" "}
                  {100 - Math.round(recommendationWeight * 100)}%
                </p>
              </div>
              <div className="weight-control">
                <div className="weight-labels">
                  <span>유사도 중심</span>
                  <span>개인화 중심</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round(recommendationWeight * 100)}
                  onChange={(event) => setRecommendationWeight(Number(event.target.value) / 100)}
                  aria-label="개인화 유사도 가중치"
                />
              </div>
            </div>

            <div className="search-actions">
              <button type="submit" form="search-composer-form" className="primary-button" disabled={isSearching}>
                {isSearching ? "검색 중..." : "검색 실행"}
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={loadAiRecommendations}
                disabled={isRefreshingRecommendations || !isRegistered}
              >
                {isRefreshingRecommendations ? "AI 추천 불러오는 중..." : "AI 추천"}
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={loadAiRecommendations}
                disabled={isRefreshingRecommendations || !isRegistered}
              >
                {isRefreshingRecommendations ? "결과 새로고침 중..." : "결과 새로고침"}
              </button>
            </div>
            <p className="search-hint">텍스트만, 이미지만 또는 둘을 함께 검색할 수 있습니다.</p>
            {recommendationError ? <p className="status-text">{recommendationError}</p> : null}
          </div>

          <form id="search-composer-form" className="search-composer" onSubmit={handleSubmit}>
            <div className="search-tabs" aria-label="검색 모드">
              <button
                type="button"
                className={searchMode === "text" ? "active" : ""}
                onClick={() => setSearchMode("text")}
              >
                텍스트
              </button>
              <button
                type="button"
                className={searchMode === "image" ? "active" : ""}
                onClick={() => setSearchMode("image")}
              >
                이미지
              </button>
              <button
                type="button"
                className={searchMode === "multimodal" ? "active" : ""}
                onClick={() => setSearchMode("multimodal")}
              >
                텍스트 + 이미지
              </button>
            </div>

            <label className="search-box">
              <span>텍스트 검색어</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="예: 광택감 있는 블랙 아우터와 실버 포인트 자켓"
                aria-label="텍스트 검색어"
              />
            </label>

            <div className="composer-grid">
              <label className="upload-tile upload-label">
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <p>이미지 업로드</p>
                <span>
                  {uploadedImage
                    ? `${uploadedImage.name} · ${uploadedImage.sizeLabel}`
                    : "착장 사진, 스크린샷, 무드보드 이미지를 올려 보세요"}
                </span>
              </label>

              <div className="context-tile">
                <p>현재 검색 상태</p>
                <span>{helperMessage}</span>
              </div>
            </div>

            <div className="signal-list">
              <div className="signal-chip">
                <strong>입력 텍스트</strong>
                <span>{query.trim() || "텍스트 없이 이미지 기반 검색 대기 중"}</span>
              </div>
              <div className="signal-chip">
                <strong>업로드 이미지</strong>
                <span>{uploadedImage ? uploadedImage.name : "아직 업로드된 이미지가 없습니다."}</span>
              </div>
              <div className="signal-chip">
                <strong>실행 모드</strong>
                <span>{modeLabel}</span>
              </div>
            </div>

            <div className="search-actions">
              <span className="search-hint">????, ???? ?? ?? ?? ??? ? ????.</span>
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                {hasSearched ? "Personalized Search Results" : "Search Results"}
              </p>
              <h3>{hasSearched ? "검색과 추천을 함께 반영한 결과" : "검색 결과"}</h3>
            </div>
            <div className="heading-metrics">
              <span className="metric">응답 시간 {mergedSearchLatency}</span>
              <span className="metric">결과 수 {mergedSearchResults.length}</span>
            </div>
          </div>

          <div className="recommendation-toolbar">
            <div className="recommendation-actions">
              <div className="topn-group" role="group" aria-label="Top N 검색 결과 개수">
                {[3, 5, 10].map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={topN === count ? "mini-button active" : "mini-button"}
                    onClick={() => setTopN(count)}
                  >
                    Top {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {mergedSearchResults.length === 0 ? (
            <div className="empty-state">
              <p>{searchEmptyMessage}</p>
            </div>
          ) : (
            <div className="result-list">
              {mergedSearchResults.map((item) => (
                <article key={item.id} className="result-card">
                  <ResultVisual imageUrl={item.imageUrl} title={item.title} accent={item.accent} />
                  <div className="result-meta">
                    <div className="result-topline">
                      <p>{item.brand}</p>
                      <strong>{item.price}</strong>
                    </div>
                    <h4>{item.title}</h4>
                    <p>{item.summary}</p>
                    <div className="result-stats">
                      <span className="badge">
                        {mergedSearchScoreLabel} {(item.similarity * 100).toFixed(1)}%
                      </span>
                      <span className="badge">{item.searchType}</span>
                      <span className="badge">응답 {item.responseTime}</span>
                      {hasPersonalizedSearchResults ? (
                        <span className="badge">{searchResultPersona}</span>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Budget Set</p>
              <h3>예산 안에서 구성한 추천 세트</h3>
            </div>
            <div className="heading-metrics">
              <span className="metric">예산 {budgetLabel}</span>
              <span className="metric">세트 수 {budgetSets.setCount}</span>
            </div>
          </div>

          <div className="recommendation-toolbar">
            <div className="recommendation-controls">
              <label className="user-id-field">
                <span>User ID</span>
                <input
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  placeholder="예: user_1024"
                  aria-label="예산 세트 사용자 ID"
                  disabled={!isRegistered}
                />
              </label>
              <label className="user-id-field budget-field">
                <span>예산</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="예: 200000"
                  aria-label="예산 세트 예산"
                />
              </label>
            </div>
            <div className="recommendation-actions">
              <button
                type="button"
                className="primary-button"
                onClick={loadBudgetSets}
                disabled={isLoadingBudgetSets || !isRegistered}
              >
                {isLoadingBudgetSets ? "세트 구성 중..." : "예산 안에서 세트 보기"}
              </button>
            </div>
          </div>

          {budgetSetError ? <p className="status-text">{budgetSetError}</p> : null}

          {budgetSets.sets.length === 0 ? (
            <p className="status-text">예산 안에서 세트 보기를 누르면 추천 조합 결과가 여기에 표시됩니다.</p>
          ) : null}

          <div className="recommendation-list">
            {budgetSets.sets.map((setItems, setIndex) => (
              <article key={`set-${setIndex}`} className="panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Outfit Set</p>
                    <h3>세트 {setIndex + 1}</h3>
                  </div>
                  <div className="heading-metrics">
                    <span className="metric">
                      총액{" "}
                      {setItems
                        .reduce((sum, item) => sum + Number(item.price.replace(/[^0-9]/g, "") || 0), 0)
                        .toLocaleString("ko-KR")}
                      원
                    </span>
                  </div>
                </div>
                <div className="result-list">
                  {setItems.map((item) => (
                    <div key={`${setIndex}-${item.id}`} className="result-card">
                      <ResultVisual imageUrl={item.imageUrl} title={item.title} accent={item.accent} />
                      <div className="result-meta">
                        <div className="result-topline">
                          <p>{item.brand}</p>
                          <strong>{item.price}</strong>
                        </div>
                        <h4>{item.title}</h4>
                        <p>{item.category}</p>
                        <div className="result-stats">
                          <span className="badge">세트 점수 {(item.score * 100).toFixed(1)}%</span>
                          <span className="badge">{item.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

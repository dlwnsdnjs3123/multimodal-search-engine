export type PersonaOption = {
  key: string;
  name: string;
  title: string;
  summary: string;
  traits: string[];
};

export const personaOptions: PersonaOption[] = [
  {
    key: "trendsetter",
    name: "트렌드 주도형",
    title: "새로운 스타일에 대한 빠른 수용",
    summary: "유행 변화에 민감한 스타일 탐색 성향",
    traits: ["유행 민감", "스타일 시도", "빠른 반응"],
  },
  {
    key: "practical",
    name: "실용주의형",
    title: "활용도와 편안함 중심의 선택",
    summary: "다양한 상황에 어울리는 실용적 선호",
    traits: ["실용성", "기본 아이템", "활용도"],
  },
  {
    key: "value",
    name: "가성비 추구형",
    title: "가격 대비 만족도 중심의 판단",
    summary: "혜택과 가격 메리트를 함께 보는 소비 성향",
    traits: ["가격 민감", "할인 선호", "비교 구매"],
  },
  {
    key: "brand_loyal",
    name: "브랜드 충성형",
    title: "선호 브랜드 중심의 반복 선택",
    summary: "익숙한 브랜드 경험을 중시하는 구매 성향",
    traits: ["브랜드 선호", "재구매", "안정적 취향"],
  },
  {
    key: "impulse",
    name: "충동구매형",
    title: "즉각적인 매력에 대한 빠른 반응",
    summary: "첫인상과 디테일 중심의 직관적 선택",
    traits: ["빠른 결정", "즉흥성", "시각 반응"],
  },
  {
    key: "careful",
    name: "신중탐색형",
    title: "충분한 비교를 바탕으로 한 결정",
    summary: "리뷰와 가격 정보를 살피는 신중한 탐색 성향",
    traits: ["비교 탐색", "정보 수집", "신중한 결정"],
  },
  {
    key: "repeat_stable",
    name: "반복구매형",
    title: "검증된 선택의 안정적 반복",
    summary: "만족했던 제품을 다시 찾는 익숙한 소비 패턴",
    traits: ["재구매", "안정성", "반복 선택"],
  },
  {
    key: "color_focus",
    name: "색상집중형",
    title: "선호 색감 중심의 스타일 선택",
    summary: "특정 컬러 계열을 우선으로 보는 시각적 취향",
    traits: ["컬러 우선", "톤 선호", "시각 취향"],
  },
  {
    key: "category_focus",
    name: "카테고리집중형",
    title: "관심 카테고리 안에서의 깊은 비교",
    summary: "원하는 카테고리 안에서 옵션을 좁혀가는 탐색 성향",
    traits: ["카테고리 몰입", "집중 비교", "명확한 관심사"],
  },
];

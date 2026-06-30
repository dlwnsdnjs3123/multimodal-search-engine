# FitFind - 패션 멀티모달 검색 및 추천 시스템

![시작 화면](docs/screenshot_intro.png)

FitFind는 패션 상품 탐색에서 검색과 추천을 하나의 흐름으로 연결한 멀티모달 서비스형 프로젝트입니다. 텍스트와 이미지 기반 검색, 사용자 취향 반영 추천, 예산 기반 코디 추천, 추천 이유 생성까지 하나의 서비스 안에서 구현했습니다.

이 저장소는 [oh130/fit-find](https://github.com/oh130/fit-find)의 내용을 기반으로 정리한 버전입니다.

## 담당 역할

-이준원 - 데이터 처리 및 추천모델 개발 지원
-홍찬근 - CLIP Embedding 및 멀티모달 구현
-장지원 - 추천모델 메인 개발
-오승민 - 벡엔드 개발
-손석범 - 평가/대시보드 및 프론트엔드


## 프로젝트 개요

기존 패션 서비스에서는 원하는 상품을 말로 찾거나 이미지를 기준으로 비슷한 상품을 찾는 경험, 그리고 개인 취향에 맞는 추천 경험이 분리되어 있는 경우가 많습니다. FitFind는 이 문제를 해결하기 위해 다음 기능을 하나의 흐름으로 통합했습니다.

- 텍스트와 이미지 기반 멀티모달 검색
- 사용자 취향과 행동 로그를 반영한 개인화 추천
- 예산 제약을 고려한 코디 세트 추천
- LLM 기반 추천 이유 생성
- 성능 지표와 실험 결과를 확인할 수 있는 대시보드

## 주요 기능

- `CLIP + FAISS` 기반 텍스트/이미지 검색
- Two-Tower 후보 생성 모델
- Logistic Regression 기반 랭킹
- e-Greedy MAB 기반 탐색/활용 조정
- Redis 기반 실시간 사용자 이벤트 반영
- Gemini 기반 추천 이유 생성
- 예산 조건을 반영한 코디 세트 생성

## 기술 스택

| 영역 | 기술 |
|------|------|
| 검색 | CLIP, FAISS HNSW |
| 추천 | Two-Tower, Logistic Regression, e-Greedy MAB |
| 백엔드 | FastAPI, Redis, Docker Compose |
| 프론트엔드 | React, Vite, TypeScript |
| 대시보드 | Streamlit |
| LLM 연동 | Gemini API |
| 데이터 | H&M Personalized Fashion Recommendations |

## 시스템 구성

- Frontend (`:3000`)
- API Gateway (`:8000`)
- Search Engine (`:8002`)
- Recommendation Models (`:8003`)
- Dashboard (`:8501`)
- Redis (`:6379`)

서비스는 검색, 추천, 실시간 이벤트 반영, 실험 지표 모니터링을 각각 분리된 구성요소로 나누고, Docker Compose로 전체를 함께 실행하도록 설계했습니다.

## 실행 방법

### 1. 데이터 준비

Kaggle의 H&M Personalized Fashion Recommendations 데이터를 내려받아 아래 경로에 배치합니다.

```text
data/raw/
|-- articles.csv
|-- customers.csv
`-- transactions_train.csv
```

### 2. 환경 변수 설정

`.env.example`을 복사해 `.env`를 만들고 필요한 API 키를 입력합니다.

```bash
cp .env.example .env
```

### 3. 데이터 파이프라인 실행

```bash
docker compose run --rm data-pipeline
```

### 4. 서비스 실행

```bash
docker compose up --build
```

## 확인 가능한 화면

- 웹 앱: `http://localhost:3000`
- API Gateway: `http://localhost:8000`
- Search Engine: `http://localhost:8002`
- Recommendation Models: `http://localhost:8003`
- Dashboard: `http://localhost:8501`

## 프로젝트 의미

이 프로젝트는 단일 모델 실험이 아니라 검색, 추천, 사용자 행동 반영, 실험 대시보드까지 포함한 서비스형 AI 시스템을 목표로 구성되었습니다. 포트폴리오 관점에서는 추천 시스템, 검색 시스템, MLOps형 파이프라인, 프론트엔드 연동 경험을 함께 보여줄 수 있다는 점이 강점입니다.

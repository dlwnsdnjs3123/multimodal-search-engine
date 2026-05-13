# 멀티모달 검색 및 Multi-Stage 추천 시스템

패션 도메인 지능형 스타일링 서비스 — 2026-1 Capstone Design I  
팀명: 사나이들

---

## 아키텍처

```
사용자 (Browser / API Client)
         │
         ▼
┌─────────────────────┐
│   Frontend :3000    │  React + Vite
└────────┬────────────┘
         │ HTTP
         ▼
┌─────────────────────┐
│  API Gateway :8000  │  FastAPI — 단일 진입점
│  - POST /api/search │
│  - GET  /api/recommend
│  - POST /api/events │
└──┬──────────────┬───┘
   │              │
   ▼              ▼
┌──────────┐  ┌──────────────┐
│  Search  │  │  Rec-Models  │
│  Engine  │  │    :8003     │
│  :8002   │  │              │
│          │  │ Candidate    │
│ CLIP     │  │ Generation   │
│ FAISS    │  │ → Ranking    │
│ HNSW     │  │ → Re-ranking │
└──────────┘  │ → MAB        │
              └──────┬───────┘
                     │
              ┌──────▼───────┐
              │  Redis :6379 │  Feature Store
              │              │  - recent_clicks
              │              │  - session_interest
              │              │  - click_count
              └──────────────┘

┌─────────────────────┐     ┌──────────────────┐
│  Dashboard :8501    │     │  Simulator       │
│  Streamlit          │     │  행동 로그 생성   │
│  - 검색 품질 지표   │     │  (구현 예정)     │
│  - 추천 성능 지표   │     └──────────────────┘
│  - A/B 테스트 결과  │
└─────────────────────┘
```

---

## 실행 방법

### 사전 요구사항

- Docker Desktop (Docker Compose 포함)
- RAM 16GB 이상 권장

### 전체 시스템 실행

```bash
docker-compose up
```

서비스별 접속 주소:

| 서비스 | 주소 |
|---|---|
| API Gateway | http://localhost:8000 |
| Search Engine | http://localhost:8002 |
| Recommendation | http://localhost:8003 |
| Frontend | http://localhost:3000 |
| Dashboard | http://localhost:8501 |

### 데이터 파이프라인 실행 (최초 1회)

```bash
python data_pipeline/build_article_features.py
python data_pipeline/build_customer_features.py
python data_pipeline/build_item_features.py
python data_pipeline/build_ranking_train_data.py
```

---

## API 사용 예시

### 검색 API

```bash
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "검정 오버핏 후드티", "top_k": 10}'
```

응답:

```json
{
  "search_type": "text",
  "results": [
    {"product_id": "0825137001", "name": "SABLE denim jacket", "score": 0.794, "price": 0.0}
  ],
  "latency_ms": 42.0,
  "total_count": 10
}
```

### 추천 API

```bash
curl "http://localhost:8000/api/recommend?user_id=U1234&top_n=10"
```

응답:

```json
{
  "user_id": "U1234",
  "recommendations": [
    {"product_id": "P11111", "score": 0.85, "reason": "ranking_score", "is_exploration": false},
    {"product_id": "P99999", "score": 0.45, "reason": "mab_exploration", "is_exploration": true}
  ],
  "pipeline_latency": {
    "candidate_ms": 45,
    "ranking_ms": 62,
    "reranking_ms": 12,
    "total_ms": 127
  },
  "session_context": {
    "recent_clicks": ["P001", "P002"],
    "session_interest": {"아우터": 3}
  }
}
```

### 이벤트 기록 API

```bash
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -d '{"user_id": "U1234", "item_id": "P001", "event_type": "click", "category": "아우터"}'
```

---

## 팀 구성 및 역할

| 이름 | 담당 파트 |
|---|---|
| 오승민 | API Gateway, Redis Feature Store, Docker Compose, 인프라 |
| 이준원 | 데이터 파이프라인 |
| 홍찬근 | 검색 엔진 (CLIP + FAISS) |
| 장지원 | 추천 모델 (Two-Tower, DeepFM, Re-ranking) |
| 손석범 | 프론트엔드, 평가 대시보드 |

---

## 기술 스택

- **검색**: CLIP (openai/clip-vit-base-patch32), FAISS HNSW
- **추천**: Two-Tower, DeepFM, Epsilon-Greedy MAB
- **서빙**: FastAPI, Redis, Docker Compose
- **프론트엔드**: React, Vite, TypeScript
- **대시보드**: Streamlit
- **데이터**: H&M Personalized Fashion Recommendations (Kaggle)

---

## 2026-05-13 Data & Simulator Update

이번 업데이트에서는 데이터 파이프라인과 시뮬레이터의 페르소나 체계를 9개 기준으로 일치시키고, 실제 시뮬레이션 로그에서 모든 페르소나가 유의미하게 등장하도록 분포를 재조정했다.

주요 반영 내용:
- `simulator/main.py`를 `persona_config_9.yaml` 기준으로 수정하여 9개 페르소나 모두 실시간 이벤트 생성 가능하도록 변경
- 시뮬레이터 이벤트 흐름을 `search / view / cart / purchase` 기준으로 정리
- `data_pipeline/build_user_persona_scores.py`와 `build_item_persona_scores.py` 점수식을 재조정하여 희귀 페르소나가 실제 로그에 반영되도록 보정
- Docker 없이도 시뮬레이터 로직을 빠르게 검증할 수 있도록 `dry-run` 모드 추가

검증 결과:
- `test` 및 `dev` 모드에서 9개 페르소나 모두 이벤트 생성 확인
- `dev` 모드 기준 `simulated_events_dev.csv` 200,000건 생성 완료
- `missing_search_query_rows = 0`
- `missing_item_rows = 0`

관련 문서:
- `docs/data_simulator_work_report_2026-05-13.md`
- `docs/remaining_issues.txt`
- `persona/` 폴더 내 각 산출물 정의 문서

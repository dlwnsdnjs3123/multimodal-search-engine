# Dashboard

현재 평가 대시보드 구현은 `evaluation/streamlit_app.py`에 있습니다.

Docker Compose에서는 `dashboard` 서비스가 `./evaluation`을 빌드해 Streamlit 대시보드를 `http://localhost:8501`에 노출합니다.

이 폴더는 초기 작업 흔적을 보존하는 stub이며, 새 대시보드 코드는 `evaluation/` 아래에 추가하는 것을 권장합니다.

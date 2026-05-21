# 카공지도

당신 근처에 있는 카공하기 좋은 카페를 알려드려요

## 📚 문서

- **테이블 정의서 (구글 시트, 진실의 원천)**
  https://docs.google.com/spreadsheets/d/1M6mdoHXGLn63yE-QnfdG6pKi7LL_-FGfzLmiyAyXtIY/edit
- **프로젝트 가이드**: [`CLAUDE.md`](./CLAUDE.md)
- **SQL 마이그레이션 스크립트**: 레포 루트의 `supabase_*.sql` 파일들
  - `supabase_tables.sql` — 초기 테이블 생성
  - `supabase_rls.sql` — 어드민/공개 테이블 RLS
  - `supabase_auth_rls.sql` — Anonymous Auth + 개인 테이블 RLS
  - `supabase_notices.sql` — 공지사항 테이블 + RLS
  - `supabase_reports_cascade.sql` — reports FK CASCADE 변경
  - `supabase_reset_users.sql` — 사용자 데이터 초기화 (테스트용)
  - `supabase_updated_at_triggers.sql` — updated_at 자동 갱신 트리거

## 🚀 개발 명령어

```bash
npm install        # 의존성 설치 (처음 한 번)
npm run dev        # 개발 서버 시작
npm run build      # 배포용 번들 빌드
npm run build:safe # git pull + install + 빌드 (배포 전 권장)
npm run build:admin # 어드민 페이지 빌드 (Vercel 배포용)
npm run deploy     # 토스 콘솔에 배포
```

## 🏗 기술 스택

- **플랫폼**: 토스 미니앱 WebView (`@apps-in-toss/web-framework 2.5+`)
- **프레임워크**: React 18 + TypeScript
- **빌드**: Rsbuild + Granite
- **지도**: 카카오맵 JavaScript SDK
- **카페 데이터**: 카카오 로컬 API (카테고리: CE7)
- **DB / Auth**: Supabase (Anonymous Auth + RLS)
- **어드민 배포**: Vercel

## 🌿 브랜치 전략

```
main              ← 배포 브랜치 (직접 커밋 금지)
  └── develop     ← 개발 통합 브랜치
       └── feature/frontend-[기능명]   ← 디자이너/프론트 작업
       └── feature/backend-[기능명]    ← 개발자 작업
```

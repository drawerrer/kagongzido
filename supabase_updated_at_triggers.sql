-- ─────────────────────────────────────────────────────────────
-- updated_at 자동 갱신 트리거 일괄 적용
-- ─────────────────────────────────────────────────────────────
-- 대상 테이블: users / stores / favorites / collections / reviews
-- (notices 는 supabase_notices.sql 에서 이미 트리거 설치됨)
--
-- 효과: UPDATE 가 발생할 때마다 updated_at = now() 자동 세팅
--
-- 적용 방법:
--   Supabase Dashboard → SQL Editor → 전체 복사 후 Run
-- ─────────────────────────────────────────────────────────────

-- ═════════════════════════════════════════════════════════════
-- 1. 공통 트리거 함수 (이미 있어도 재정의 OK)
-- ═════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ═════════════════════════════════════════════════════════════
-- 2. 각 테이블에 트리거 적용
-- ═════════════════════════════════════════════════════════════

-- users
DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- stores
DROP TRIGGER IF EXISTS stores_set_updated_at ON stores;
CREATE TRIGGER stores_set_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- favorites
DROP TRIGGER IF EXISTS favorites_set_updated_at ON favorites;
CREATE TRIGGER favorites_set_updated_at
  BEFORE UPDATE ON favorites
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- collections
DROP TRIGGER IF EXISTS collections_set_updated_at ON collections;
CREATE TRIGGER collections_set_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- reviews
DROP TRIGGER IF EXISTS reviews_set_updated_at ON reviews;
CREATE TRIGGER reviews_set_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- notices (이미 있지만 안전을 위해 재적용)
DROP TRIGGER IF EXISTS notices_set_updated_at ON notices;
CREATE TRIGGER notices_set_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();


-- ═════════════════════════════════════════════════════════════
-- 3. 검증 (선택)
-- ═════════════════════════════════════════════════════════════
-- 트리거 목록 확인
-- SELECT event_object_table AS table_name, trigger_name
-- FROM information_schema.triggers
-- WHERE event_object_schema = 'public'
--   AND trigger_name LIKE '%_set_updated_at'
-- ORDER BY event_object_table;

-- 동작 확인 (users 테이블에서 본인 row UPDATE 후 updated_at 변경 여부)
-- UPDATE users SET nickname = nickname WHERE id = '...본인 user id...';
-- SELECT id, nickname, updated_at FROM users WHERE id = '...본인 user id...';

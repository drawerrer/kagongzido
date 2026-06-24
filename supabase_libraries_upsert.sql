-- =========================================================
-- 도서관 데이터 UPSERT (스프레드시트 기준)
-- Supabase Dashboard > SQL Editor 에서 실행하세요
-- ON CONFLICT(name) → 이미 있으면 업데이트, 없으면 삽입
-- =========================================================

INSERT INTO libraries (
  name,
  address_road,
  latitude,
  longitude,
  phone_number,
  business_hours,
  ent_price,
  ent_condition,
  lt_seat_status,
  facilities,
  amenities,
  badges,
  website_url
)
VALUES

  -- 1. 아차산숲속도서관 (서울 광진구)
  (
    '아차산숲속도서관',
    '서울 광진구 광화문로 139',
    37.5524707,
    127.1008787,
    '02-2049-2970',
    '매일 09:00~18:00' || chr(10) || '월 정기휴무',
    '무료',
    '조건 없음',
    '지정 좌석에서만 가능',
    NULL,
    ARRAY['separateRestroom', 'indoorRestroom'],
    NULL,
    'https://www.gwangjinlib.seoul.go.kr/achasan/index.do'
  ),

  -- 2. 서울시립미술아카이브 (서울 종로구)
  (
    '서울시립미술아카이브',
    '서울 종로구 평창로 101',
    37.6077663,
    126.9719383,
    '02-2124-7400',
    '하절기(3~10월) 10:00~19:00' || chr(10) || '동절기(11~2월) 10:00~18:00' || chr(10) || '월 정기휴무',
    '무료',
    '조건 없음',
    '사용 가능',
    ARRAY['지상 1~2층'],
    ARRAY['separateRestroom', 'indoorRestroom'],
    NULL,
    'https://sema.seoul.go.kr/semaaa/front/main.do'
  ),

  -- 3. 전쟁기념관 6.25전쟁 아카이브센터 (서울 용산구)
  (
    '전쟁기념관 6.25전쟁 아카이브센터',
    '서울 용산구 이태원로 29',
    37.5370385,
    126.9778325,
    NULL,
    '매일 09:00~21:00' || chr(10) || '화 정기휴무',
    '무료',
    '조건 없음',
    '사용 가능',
    ARRAY['지상 2층'],
    ARRAY['parking', 'separateRestroom', 'indoorRestroom'],
    NULL,
    'https://www.warmemo.or.kr:8443/Home/index'
  ),

  -- 4. 국회도서관 (서울 영등포구)
  (
    '국회도서관',
    '서울 영등포구 의사당대로 1',
    37.5313456,
    126.9170142,
    '02-6788-4211',
    '주중 09:00~21:00' || chr(10) || '매월 2·4째주 토요일 정기휴무',
    '무료',
    '열람증 발급',
    '사용 가능',
    ARRAY['지하 1층~지상 5층'],
    ARRAY['parking', 'indoorRestroom'],
    NULL,
    'https://www.nanet.go.kr/main.do'
  ),

  -- 5. 논현문화마루도서관 (서울 강남구)
  (
    '논현문화마루도서관',
    '서울 강남구 논현로131길 40',
    37.5134693,
    127.0271058,
    '02-512-8580',
    '주중 09:00~22:00' || chr(10) || '주말 09:00~18:00' || chr(10) || '월 정기휴무',
    '무료',
    '조건 없음',
    '사용 가능',
    ARRAY['지상 4~5층'],
    ARRAY['indoorRestroom'],
    NULL,
    'https://library.gangnam.go.kr/nmmmlib/'
  ),

  -- 8. 소진서림 (서울 강남구, 카카오 검색 실패로 좌표 없음)
  (
    '소진서림',
    '서울특별시 강남구 청담동 131-8',
    37.5250485,
    127.042735,
    NULL,
    '매일 09:00~21:00',
    '법인 이용권(5시간) 30,000원',
    '입장료',
    '지정 좌석에서만 가능',
    ARRAY['지하 1층'],
    ARRAY['indoorRestroom'],
    NULL,
    'https://sojonseolim.com/'
  )

ON CONFLICT (name) DO UPDATE SET
  address_road   = EXCLUDED.address_road,
  latitude       = EXCLUDED.latitude,
  longitude      = EXCLUDED.longitude,
  phone_number   = EXCLUDED.phone_number,
  business_hours = EXCLUDED.business_hours,
  ent_price      = EXCLUDED.ent_price,
  ent_condition  = EXCLUDED.ent_condition,
  lt_seat_status = EXCLUDED.lt_seat_status,
  facilities     = EXCLUDED.facilities,
  amenities      = EXCLUDED.amenities,
  badges         = EXCLUDED.badges,
  website_url    = EXCLUDED.website_url,
  updated_at     = now();

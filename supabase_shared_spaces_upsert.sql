-- =========================================================
-- 공유공간 데이터 UPSERT (스프레드시트 기준)
-- Supabase Dashboard > SQL Editor 에서 실행하세요
-- ON CONFLICT(name) → 이미 있으면 업데이트, 없으면 삽입
-- =========================================================

INSERT INTO shared_spaces (
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

  -- 1. 서울창업허브 (서울 마포구)
  (
    '서울창업허브',
    '서울 마포구 백범로31길 21',
    37.54650708,
    126.9500286,
    '02-2115-2000',
    '주중 09:00~21:00' || chr(10) || '수 09:00~18:00' || chr(10) || '월 정기휴무',
    '무료',
    '조건 없음',
    '사용 가능',
    ARRAY['지상 1~3층'],
    ARRAY['groupVisit', 'separateRestroom', 'indoorRestroom'],
    NULL,
    'https://hubgongdeok.startup-plus.kr/'
  ),

  -- 2. 과천시 청년과 비행지구 (경기 과천시, 카카오 검색 실패)
  (
    '과천시 청년과 비행지구',
    '',
    NULL,
    NULL,
    NULL,
    '월·화·목·금 10:00~21:00' || chr(10) || '수 10:00~16:00' || chr(10) || '토 정기휴무',
    '만 19~39세만 이용 가능',
    '연령 제한',
    '사용 가능',
    ARRAY['지상 5층'],
    ARRAY['parking', 'groupVisit', 'separateRestroom', 'indoorRestroom'],
    NULL,
    'https://www.instagram.com/gc_fly_earth/'
  ),

  -- 3. KT&G 상상플래닛 (서울 성동구)
  (
    'KT&G 상상플래닛',
    '서울 성동구 독성13길 36',
    37.54138566,
    127.0581489,
    '070-4801-2255',
    '주중 09:00~18:00' || chr(10) || '주말 11:00~21:00',
    '무료',
    '조건 없음',
    '사용 가능',
    ARRAY['지상 1~2층'],
    ARRAY['separateRestroom', 'indoorRestroom'],
    NULL,
    'https://www.sangsangplanet.com/'
  ),

  -- 4. 마포청년나루 공유 라운지 (서울 마포구, 카카오 검색 실패)
  (
    '마포청년나루 공유 라운지',
    '',
    NULL,
    NULL,
    NULL,
    '주중 10:00~21:00' || chr(10) || '주말 10:00~18:00' || chr(10) || '월 정기휴무',
    '만 19~39세만 이용 가능',
    '연령 제한',
    '사용 가능',
    ARRAY['지상 3층'],
    ARRAY['separateRestroom', 'indoorRestroom', 'groupVisit'],
    NULL,
    'https://inaroo.or.kr/'
  ),

  -- 5. 청년예술청 (서울 서대문구)
  (
    '청년예술청',
    '서울 서대문구 경기대로 26-26',
    37.56155922,
    126.9623883,
    '0507-1324-9745',
    '매일 13:00~22:00' || chr(10) || '월 정기휴무',
    '무료',
    '조건 없음',
    '사용 가능',
    ARRAY['지하 2층'],
    ARRAY['parking', 'groupVisit', 'separateRestroom', 'indoorRestroom'],
    NULL,
    'https://www.sapy.kr/MAIN'
  ),

  -- 6. 알파룸 (경기 과천시)
  (
    '알파룸',
    '경기 과천시 관문로 65',
    37.41662759,
    126.9761058,
    '010-7904-1174',
    '주중 10:00~18:00' || chr(10) || '수 11:00~17:00' || chr(10) || '월 정기휴무',
    '무료',
    '조건 없음',
    '사용 가능',
    ARRAY['지하 1층'],
    ARRAY['parking', 'groupVisit', 'separateRestroom', 'indoorRestroom'],
    NULL,
    'https://alpharoom.kr/'
  ),

  -- 7. 현대카드 아트 라이브러리 (서울 용산구)
  (
    '현대카드 아트 라이브러리',
    '서울 용산구 이태원로 248',
    37.53681028,
    127.0008644,
    '02-2014-7899',
    '화~토 12:00~21:00' || chr(10) || '일 12:00~18:00' || chr(10) || '월 정기휴무',
    '현대카드 회원 본인 및 동반 2인 입장 가능(월~목)' || chr(10) || '현대카드 DIVE 앱 회원 본인 입장 가능 (월 8회, 주말·공휴일 포함)',
    '회원 가입',
    '사용 가능',
    ARRAY['지상 2층'],
    ARRAY['coffeeMachine'],
    NULL,
    'https://dive.hyundaicard.com/web/artlibrary/spaceMain.hdc'
  ),

  -- 8. 카네트 라운지 (경기 성남시)
  (
    '카네트 라운지',
    '경기 성남시 분당구 불정로 6',
    37.3959161,
    127.1053044,
    '1588-3830',
    '주중 09:30~19:30' || chr(10) || '주말 정기휴무',
    '무료',
    '조건 없음',
    '사용 가능',
    ARRAY['지상 1~2층'],
    ARRAY['parking', 'groupVisit'],
    NULL,
    NULL
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

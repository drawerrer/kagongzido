import { useState } from 'react';
import { supabase } from '../../pages/AdminPage';
import { searchKakaoPlaces, type KakaoPlaceDoc } from '../../services/kakaoLocal';
import HourCaseEditor, {
  hourCasesFromRaw, serializeHourCases, type HourCase,
  LastOrderCaseEditor, lastOrderCasesFromRaw, serializeLastOrderCases, type LastOrderCase,
} from './HourCaseEditor';
import PhotoPicker, { type PhotoItem } from './PhotoPicker';
import NaverAutofill, { type NaverAutofillResult } from './NaverAutofill';

// ─── 카테고리 ───────────────────────────────────────────────────
type Category = 'cafe' | 'library' | 'shared_space';

const CATEGORY_META: Record<Category, { label: string; table: 'stores' | 'libraries' | 'shared_spaces' }> = {
  cafe: { label: '카페', table: 'stores' },
  library: { label: '도서관', table: 'libraries' },
  shared_space: { label: '공유공간', table: 'shared_spaces' },
};

// ─── 실제 프로덕션 옵션 값 (WriteReviewPage.tsx / FilterModal.tsx 기준) ──
// 카페(stores) 전용
const OUTLET_OPTS = ['부족', '적당', '넉넉'];
const SEAT_OPTS = ['불편', '적당', '편안'];
// 카페/도서관/공유공간 공통
const NOISE_OPTS = ['시끄러움', '적당', '조용'];
// 도서관/공유공간(libraries, shared_spaces) 전용 — DB 컬럼은 단일값(text)
const LAPTOP_OPTS = ['가능', '지정 좌석에서만 가능', '불가'];
const ENT_CONDITION_OPTS = ['조건 없음', '예약 필요', '입장료', '회원 가입', '열람증 발급', '연령 제한'];
const ENT_DISABLED_LIBRARY = new Set(['연령 제한']);
const ENT_DISABLED_SHARED = new Set(['예약 필요', '입장료', '열람증 발급']);
// 카페 전용 — 분위기 태그 (FilterModal.tsx MOOD_CHIPS)
const VIBE_TAG_OPTS = ['웜톤 조명', '화이트 조명', '로우톤 조명', '우드', '메탈', '화이트', '블랙', '플랜트', '스톤'];
// 공통 편의시설 (FilterModal.tsx AMENITY_CHIPS — key 기준으로 저장)
const AMENITY_OPTS: { key: string; label: string }[] = [
  { key: 'sound-moderate', label: '소음 적당' },
  { key: 'quiet', label: '조용' },
  { key: 'separateRestroom', label: '남/녀 화장실 구분' },
  { key: 'indoorRestroom', label: '내부 화장실' },
  { key: 'groupVisit', label: '단체 방문 가능' },
  { key: 'pets', label: '반려동물 동반' },
  { key: 'noTimeLimit', label: '시간제한 없음' },
  { key: 'parking', label: '주차 가능' },
  { key: 'coffeeMachine', label: '커피머신' },
  { key: 'decafFree', label: '디카페인 무료 변경' },
  { key: 'wifi', label: '무선 인터넷' },
  { key: 'takeout', label: '포장 가능' },
  { key: 'wheelchair', label: '휠체어 이용' },
];

function isCafe(category: Category) {
  return category === 'cafe';
}

// ─── 자동 채움 필드(카카오 결과 또는 수동 입력 공통) ──────────────
interface AutoFields {
  name: string;
  addressRoad: string;
  latitude: string;
  longitude: string;
  phoneNumber: string;
  websiteUrl: string;
  /** "네이버플레이스 자동 채움"에 붙여넣은 링크 — 앱의 "길 안내" 버튼이 그대로 사용 */
  naverUrl: string;
}

function emptyAutoFields(name = ''): AutoFields {
  return { name, addressRoad: '', latitude: '', longitude: '', phoneNumber: '', websiteUrl: '', naverUrl: '' };
}

function autoFieldsFromKakao(doc: KakaoPlaceDoc): AutoFields {
  return {
    name: doc.place_name,
    addressRoad: doc.road_address_name || doc.address_name || '',
    latitude: doc.y ?? '',
    longitude: doc.x ?? '',
    phoneNumber: doc.phone ?? '',
    websiteUrl: doc.place_url ?? '',
    naverUrl: '',
  };
}

// ─── 운영 정보 상태 ──────────────────────────────────────────────
interface CafeOpsFields {
  outletStatus: string;
  seatStatus: string;
  noiseStatus: string;
  vibeTags: string[];
  amenities: string[];
  basePrice: string;
  businessHours: HourCase[];
  lastOrder: LastOrderCase[];
}
function emptyCafeOps(): CafeOpsFields {
  return { outletStatus: '', seatStatus: '', noiseStatus: '', vibeTags: [], amenities: [], basePrice: '', businessHours: [], lastOrder: [] };
}

interface PlaceOpsFields {
  ltSeatStatus: string;
  noiseStatus: string;
  entCondition: string;
  entPrice: string;
  facilities: string; // 콤마 구분 자유 입력
  amenities: string[];
  businessHours: HourCase[];
}
function emptyPlaceOps(): PlaceOpsFields {
  return { ltSeatStatus: '', noiseStatus: '', entCondition: '', entPrice: '', facilities: '', amenities: [], businessHours: [] };
}

// ─── 공통 칩 컴포넌트 ────────────────────────────────────────────
function Chip({ label, active, disabled, onClick }: { label: string; active: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        fontSize: 12.5, padding: '7px 12px', borderRadius: 20,
        border: `1.5px solid ${active ? '#191F28' : '#E5E8EB'}`,
        background: active ? '#191F28' : '#fff',
        color: disabled ? '#C4C9D0' : active ? '#fff' : '#4E5968',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textDecoration: disabled ? 'line-through' : 'none',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#8B95A1', display: 'block', marginBottom: 6 }}>
        {label} {hint && <span style={{ fontWeight: 400, color: '#C4C9D0' }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 38, borderRadius: 9, border: '1.5px solid #E5E8EB',
  padding: '0 12px', fontSize: 13.5, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

// ─── 메인 컴포넌트 ───────────────────────────────────────────────
export default function PlaceRegisterTab() {
  const [category, setCategory] = useState<Category>('cafe');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KakaoPlaceDoc[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searched, setSearched] = useState(false);

  const [panelOpen, setPanelOpen] = useState(false);
  const [auto, setAuto] = useState<AutoFields>(emptyAutoFields());
  const [selectedDoc, setSelectedDoc] = useState<KakaoPlaceDoc | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [cafeOps, setCafeOps] = useState<CafeOpsFields>(emptyCafeOps());
  const [placeOps, setPlaceOps] = useState<PlaceOpsFields>(emptyPlaceOps());
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photoFolderId, setPhotoFolderId] = useState('');
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  async function runSearch() {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError('');
    setPanelOpen(false);
    try {
      const docs = await searchKakaoPlaces(q, isCafe(category) ? { categoryGroupCode: 'CE7' } : undefined);
      setResults(docs);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : '검색 중 오류가 발생했어요.');
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  }

  // 중복 확인: 카페는 api_place_id, 도서관/공유공간은 name 기준
  async function loadExisting(table: 'stores' | 'libraries' | 'shared_spaces', matchKey: { apiPlaceId?: string; name?: string }) {
    setCheckingExisting(true);
    setExistingId(null);
    try {
      const q = supabase!.from(table).select('*');
      const { data } = matchKey.apiPlaceId
        ? await q.eq('api_place_id', matchKey.apiPlaceId).maybeSingle()
        : await q.eq('name', matchKey.name).maybeSingle();

      if (data) {
        setExistingId(data.id as string);
        if (isCafe(category)) {
          setCafeOps({
            outletStatus: (data.outlet_status as string) ?? '',
            seatStatus: (data.seat_status as string) ?? '',
            noiseStatus: (data.noise_status as string) ?? '',
            vibeTags: (data.vibe_tags as string[]) ?? [],
            amenities: (data.amenities as string[]) ?? [],
            basePrice: data.base_price != null ? String(data.base_price) : '',
            businessHours: hourCasesFromRaw(data.business_hours as string | Record<string, unknown> | null),
            lastOrder: lastOrderCasesFromRaw(data.last_order as Record<string, unknown> | null | undefined),
          });
        } else {
          setPlaceOps({
            ltSeatStatus: (data.lt_seat_status as string) ?? '',
            noiseStatus: (data.noise_status as string) ?? '',
            entCondition: (data.ent_condition as string) ?? '',
            entPrice: (data.ent_price as string) ?? '',
            facilities: ((data.facilities as string[]) ?? []).join(', '),
            amenities: (data.amenities as string[]) ?? [],
            businessHours: hourCasesFromRaw(data.business_hours as string | Record<string, unknown> | null),
          });
        }
        setAuto(prev => ({
          ...prev,
          addressRoad: (data.address_road as string) ?? prev.addressRoad,
          latitude: data.latitude != null ? String(data.latitude) : prev.latitude,
          longitude: data.longitude != null ? String(data.longitude) : prev.longitude,
          phoneNumber: (data.phone_number as string) ?? prev.phoneNumber,
          websiteUrl: (data.website_url as string) ?? prev.websiteUrl,
          naverUrl: (data.naver_url as string) ?? prev.naverUrl,
        }));

        const existingPhotos: PhotoItem[] = [];
        if (data.thumbnail_url) {
          existingPhotos.push({ id: crypto.randomUUID(), url: data.thumbnail_url as string, isThumbnail: true });
        }
        ((data.photo_urls as string[] | null) ?? []).forEach(url => {
          existingPhotos.push({ id: crypto.randomUUID(), url, isThumbnail: false });
        });
        setPhotos(existingPhotos);
      }
    } finally {
      setCheckingExisting(false);
    }
  }

  function openPanelForDoc(doc: KakaoPlaceDoc) {
    setSelectedDoc(doc);
    setAuto(autoFieldsFromKakao(doc));
    setCafeOps(emptyCafeOps());
    setPlaceOps(emptyPlaceOps());
    setPhotos([]);
    setPhotoFolderId(crypto.randomUUID());
    setExistingId(null);
    setPanelOpen(true);
    const table = CATEGORY_META[category].table;
    if (isCafe(category)) {
      loadExisting(table, { apiPlaceId: doc.id });
    } else {
      loadExisting(table, { name: doc.place_name });
    }
  }

  function openPanelManual() {
    setSelectedDoc(null);
    setAuto(emptyAutoFields(query.trim()));
    setCafeOps(emptyCafeOps());
    setPlaceOps(emptyPlaceOps());
    setPhotos([]);
    setPhotoFolderId(crypto.randomUUID());
    setExistingId(null);
    setPanelOpen(true);
    const name = query.trim();
    if (name) loadExisting(CATEGORY_META[category].table, { name });
  }

  function switchCategory(next: Category) {
    setCategory(next);
    setResults([]);
    setSearched(false);
    setPanelOpen(false);
  }

  function handleNaverAutofill(r: NaverAutofillResult) {
    const newHourCases = r.businessHoursText ? hourCasesFromRaw(r.businessHoursText) : [];
    setAuto(prev => ({ ...prev, naverUrl: r.sourceUrl }));
    if (isCafe(category)) {
      // 카페는 편의시설을 한글 라벨로 저장하는 컨벤션이라, API가 주는 영문 키를 라벨로 변환해서 병합
      const labels = r.amenities
        .map(key => AMENITY_OPTS.find(o => o.key === key)?.label)
        .filter((l): l is string => !!l);
      setCafeOps(prev => ({
        ...prev,
        amenities: Array.from(new Set([...prev.amenities, ...labels])),
        businessHours: newHourCases.length ? newHourCases : prev.businessHours,
        basePrice: r.basePrice != null ? String(r.basePrice) : prev.basePrice,
      }));
    } else {
      setPlaceOps(prev => ({
        ...prev,
        amenities: Array.from(new Set([...prev.amenities, ...r.amenities])),
        businessHours: newHourCases.length ? newHourCases : prev.businessHours,
      }));
    }
    showToast('네이버플레이스에서 정보를 불러왔어요');
  }

  const readyToSave = (() => {
    if (!auto.name.trim()) return false;
    if (isCafe(category)) {
      if (!auto.addressRoad.trim() || !auto.latitude.trim() || !auto.longitude.trim()) return false;
      return !!(cafeOps.outletStatus && cafeOps.seatStatus && cafeOps.noiseStatus);
    }
    return !!(placeOps.ltSeatStatus && placeOps.noiseStatus);
  })();

  async function handleSave() {
    if (!readyToSave || saving || !supabase) return;
    setSaving(true);
    try {
      const table = CATEGORY_META[category].table;
      const thumbnailUrl = photos.find(p => p.isThumbnail)?.url ?? photos[0]?.url ?? '';
      const photoUrls = photos.filter(p => p.url !== thumbnailUrl).map(p => p.url);

      if (isCafe(category)) {
        const apiPlaceId = selectedDoc?.id ?? `manual-${crypto.randomUUID()}`;
        const payload = {
          api_place_id: apiPlaceId,
          name: auto.name.trim(),
          category: selectedDoc?.category_name || '카페',
          address_road: auto.addressRoad.trim(),
          latitude: Number(auto.latitude),
          longitude: Number(auto.longitude),
          phone_number: auto.phoneNumber.trim() || null,
          website_url: auto.websiteUrl.trim() || null,
          outlet_status: cafeOps.outletStatus,
          seat_status: cafeOps.seatStatus,
          noise_status: cafeOps.noiseStatus,
          vibe_tags: cafeOps.vibeTags,
          amenities: cafeOps.amenities,
          base_price: Number(cafeOps.basePrice) || 0,
          business_hours: serializeHourCases(cafeOps.businessHours) || null,
          thumbnail_url: thumbnailUrl, // not null 컬럼 — 사진 없으면 빈 문자열 (기존 seed-stores.mjs와 동일 관례)
          photo_urls: photoUrls,
          // last_order/naver_url 컬럼은 각각의 마이그레이션 SQL 실행 후에만 존재 —
          // 값이 없으면 payload에서 아예 빼서 마이그레이션 전에도 나머지 저장은 깨지지 않게 함
          ...(serializeLastOrderCases(cafeOps.lastOrder) ? { last_order: serializeLastOrderCases(cafeOps.lastOrder) } : {}),
          ...(auto.naverUrl.trim() ? { naver_url: auto.naverUrl.trim() } : {}),
        };
        const { error } = await supabase.from(table).upsert(payload, { onConflict: 'api_place_id' });
        if (error) throw error;
      } else {
        const payload = {
          name: auto.name.trim(),
          address_road: auto.addressRoad.trim(),
          latitude: auto.latitude.trim() ? Number(auto.latitude) : null,
          longitude: auto.longitude.trim() ? Number(auto.longitude) : null,
          phone_number: auto.phoneNumber.trim() || null,
          website_url: auto.websiteUrl.trim() || null,
          lt_seat_status: placeOps.ltSeatStatus,
          noise_status: placeOps.noiseStatus,
          ent_condition: placeOps.entCondition || null,
          ent_price: placeOps.entPrice.trim() || null,
          facilities: placeOps.facilities.split(',').map(s => s.trim()).filter(Boolean),
          amenities: placeOps.amenities,
          business_hours: serializeHourCases(placeOps.businessHours) || null,
          thumbnail_url: thumbnailUrl || null,
          photo_urls: photoUrls,
          ...(auto.naverUrl.trim() ? { naver_url: auto.naverUrl.trim() } : {}),
        };
        const { error } = await supabase.from(table).upsert(payload, { onConflict: 'name' });
        if (error) throw error;
      }

      showToast(existingId ? '수정 사항이 저장됐어요' : `"${auto.name}" 신규 등록 완료`);
      if (query.trim()) runSearch();
    } catch (e) {
      alert('저장 실패: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  }

  const entDisabledSet = category === 'library' ? ENT_DISABLED_LIBRARY : ENT_DISABLED_SHARED;

  return (
    <div style={{ position: 'relative' }}>
      {/* 카테고리 선택 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(Object.keys(CATEGORY_META) as Category[]).map(c => (
          <button
            key={c}
            onClick={() => switchCategory(c)}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 700,
              background: category === c ? '#191F28' : '#F2F4F6',
              color: category === c ? '#fff' : '#6B7684',
            }}
          >
            {CATEGORY_META[c].label}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
          placeholder={`${CATEGORY_META[category].label} 이름으로 카카오맵 검색`}
          style={{ ...inputStyle, flex: 1, height: 42 }}
        />
        <button
          onClick={runSearch}
          disabled={searching || !query.trim()}
          style={{
            height: 42, padding: '0 18px', borderRadius: 10, border: 'none',
            background: '#191F28', color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: searching ? 'wait' : 'pointer', opacity: !query.trim() ? 0.5 : 1,
          }}
        >
          {searching ? '검색 중...' : '검색'}
        </button>
      </div>
      <p style={{ fontSize: 12, color: '#8B95A1', marginBottom: 16 }}>
        카카오맵에서 주소·좌표·전화번호를 자동으로 가져와요.
      </p>

      {searchError && <p style={{ color: '#E53E3E', fontSize: 13, marginBottom: 12 }}>{searchError}</p>}

      {/* 검색 결과 */}
      {searched && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {results.length === 0 && !searching && (
            <p style={{ fontSize: 13, color: '#8B95A1' }}>카카오 검색 결과가 없어요.</p>
          )}
          {results.map(doc => (
            <button
              key={doc.id}
              onClick={() => openPanelForDoc(doc)}
              style={{
                textAlign: 'left', background: '#fff', border: selectedDoc?.id === doc.id ? '1.5px solid #3182F6' : '1px solid #E5E8EB',
                borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#191F28' }}>{doc.place_name}</div>
              <div style={{ fontSize: 12.5, color: '#8B95A1', marginTop: 2 }}>
                {doc.road_address_name || doc.address_name}
              </div>
              <div style={{ fontSize: 11, color: '#B0B8C1', marginTop: 2 }}>{doc.category_name}</div>
            </button>
          ))}
          <button
            onClick={openPanelManual}
            style={{
              textAlign: 'left', background: '#FAFBFC', border: '1px dashed #C4C9D0',
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer', color: '#6B7684', fontSize: 13,
            }}
          >
            카카오 결과에 없어요 — "{query.trim()}" 직접 입력해서 등록
          </button>
        </div>
      )}

      {/* 등록/수정 패널 */}
      {panelOpen && (
        <div style={{ background: '#fff', border: '1px solid #E5E8EB', borderRadius: 16, padding: 20, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#191F28' }}>{auto.name || '이름 없음'}</span>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 8,
              background: existingId ? '#E9F9EE' : '#EFF6FF',
              color: existingId ? '#1A9E4E' : '#3182F6',
            }}>
              {checkingExisting ? '확인 중...' : existingId ? '기존 등록 장소 · 수정' : '신규 등록'}
            </span>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#8B95A1', marginBottom: 8 }}>기본 정보</div>
          <Field label="이름">
            <input value={auto.name} onChange={e => setAuto({ ...auto, name: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="도로명 주소">
            <input value={auto.addressRoad} onChange={e => setAuto({ ...auto, addressRoad: e.target.value })} style={inputStyle} />
          </Field>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Field label="위도">
                <input value={auto.latitude} onChange={e => setAuto({ ...auto, latitude: e.target.value })} style={inputStyle} />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="경도">
                <input value={auto.longitude} onChange={e => setAuto({ ...auto, longitude: e.target.value })} style={inputStyle} />
              </Field>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Field label="전화번호">
                <input value={auto.phoneNumber} onChange={e => setAuto({ ...auto, phoneNumber: e.target.value })} style={inputStyle} />
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="웹사이트">
                <input value={auto.websiteUrl} onChange={e => setAuto({ ...auto, websiteUrl: e.target.value })} style={inputStyle} />
              </Field>
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#8B95A1', margin: '18px 0 8px' }}>네이버플레이스 자동 채움</div>
          <NaverAutofill onResult={handleNaverAutofill} />
          <Field label="네이버플레이스 링크" hint="저장하면 앱의 '길 안내' 버튼이 이 링크를 바로 열어요">
            <input
              value={auto.naverUrl}
              onChange={e => setAuto({ ...auto, naverUrl: e.target.value })}
              placeholder="위에서 자동 채우기를 쓰면 자동으로 채워져요"
              style={inputStyle}
            />
          </Field>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#8B95A1', margin: '18px 0 8px' }}>사진</div>
          <PhotoPicker folderId={photoFolderId} value={photos} onChange={setPhotos} />

          <div style={{ fontSize: 12, fontWeight: 700, color: '#8B95A1', margin: '18px 0 8px' }}>운영 정보</div>

          {isCafe(category) ? (
            <>
              <Field label="콘센트 상태">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {OUTLET_OPTS.map(o => (
                    <Chip key={o} label={o} active={cafeOps.outletStatus === o} onClick={() => setCafeOps({ ...cafeOps, outletStatus: o })} />
                  ))}
                </div>
              </Field>
              <Field label="좌석 상태">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {SEAT_OPTS.map(o => (
                    <Chip key={o} label={o} active={cafeOps.seatStatus === o} onClick={() => setCafeOps({ ...cafeOps, seatStatus: o })} />
                  ))}
                </div>
              </Field>
              <Field label="소음 수준">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {NOISE_OPTS.map(o => (
                    <Chip key={o} label={o} active={cafeOps.noiseStatus === o} onClick={() => setCafeOps({ ...cafeOps, noiseStatus: o })} />
                  ))}
                </div>
              </Field>
              <Field label="분위기 태그">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {VIBE_TAG_OPTS.map(o => (
                    <Chip
                      key={o} label={o} active={cafeOps.vibeTags.includes(o)}
                      onClick={() => setCafeOps({
                        ...cafeOps,
                        vibeTags: cafeOps.vibeTags.includes(o) ? cafeOps.vibeTags.filter(v => v !== o) : [...cafeOps.vibeTags, o],
                      })}
                    />
                  ))}
                </div>
              </Field>
              <Field label="편의시설">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {/* 카페(stores)는 실제 운영 데이터가 한글 라벨로 저장돼 있어서(예: "무선 인터넷") 라벨을 그대로 저장 —
                      도서관/공유공간은 영문 키로 저장돼 있어서 아래 쪽 편의시설과 컨벤션이 다름 */}
                  {AMENITY_OPTS.map(({ key, label }) => (
                    <Chip
                      key={key} label={label} active={cafeOps.amenities.includes(label)}
                      onClick={() => setCafeOps({
                        ...cafeOps,
                        amenities: cafeOps.amenities.includes(label) ? cafeOps.amenities.filter(v => v !== label) : [...cafeOps.amenities, label],
                      })}
                    />
                  ))}
                </div>
              </Field>
              <Field label="기본 가격대" hint="아메리카노 기준, 원">
                <input
                  value={cafeOps.basePrice} onChange={e => setCafeOps({ ...cafeOps, basePrice: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder="예: 4500" style={inputStyle}
                />
              </Field>
              <Field label="이용시간" hint="선택">
                <HourCaseEditor value={cafeOps.businessHours} onChange={v => setCafeOps({ ...cafeOps, businessHours: v })} />
              </Field>
              <Field label="라스트오더 시간" hint="선택">
                <LastOrderCaseEditor value={cafeOps.lastOrder} onChange={v => setCafeOps({ ...cafeOps, lastOrder: v })} />
              </Field>
            </>
          ) : (
            <>
              <Field label="노트북 좌석 여부">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {LAPTOP_OPTS.map(o => (
                    <Chip key={o} label={o} active={placeOps.ltSeatStatus === o} onClick={() => setPlaceOps({ ...placeOps, ltSeatStatus: o })} />
                  ))}
                </div>
              </Field>
              <Field label="소음 수준">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {NOISE_OPTS.map(o => (
                    <Chip key={o} label={o} active={placeOps.noiseStatus === o} onClick={() => setPlaceOps({ ...placeOps, noiseStatus: o })} />
                  ))}
                </div>
              </Field>
              <Field label="입장 조건">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ENT_CONDITION_OPTS.map(o => (
                    <Chip
                      key={o} label={o} active={placeOps.entCondition === o} disabled={entDisabledSet.has(o)}
                      onClick={() => setPlaceOps({ ...placeOps, entCondition: o })}
                    />
                  ))}
                </div>
              </Field>
              <Field label="입장료" hint="자유 입력 (예: 무료 / 1일 5,000원)">
                <input value={placeOps.entPrice} onChange={e => setPlaceOps({ ...placeOps, entPrice: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="시설" hint="콤마로 구분 (예: 지상 1~3층, 스터디룸)">
                <input value={placeOps.facilities} onChange={e => setPlaceOps({ ...placeOps, facilities: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="편의시설">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {AMENITY_OPTS.map(({ key, label }) => (
                    <Chip
                      key={key} label={label} active={placeOps.amenities.includes(key)}
                      onClick={() => setPlaceOps({
                        ...placeOps,
                        amenities: placeOps.amenities.includes(key) ? placeOps.amenities.filter(v => v !== key) : [...placeOps.amenities, key],
                      })}
                    />
                  ))}
                </div>
              </Field>
              <Field label="이용시간" hint="선택">
                <HourCaseEditor value={placeOps.businessHours} onChange={v => setPlaceOps({ ...placeOps, businessHours: v })} />
              </Field>
            </>
          )}

          <button
            onClick={handleSave}
            disabled={!readyToSave || saving}
            style={{
              width: '100%', height: 46, borderRadius: 12, border: 'none', marginTop: 8,
              background: readyToSave && !saving ? '#191F28' : '#E5E8EB',
              color: readyToSave && !saving ? '#fff' : '#ADB5BD',
              fontSize: 15, fontWeight: 700, cursor: readyToSave && !saving ? 'pointer' : 'default',
            }}
          >
            {saving ? '저장 중...' : existingId ? '수정 사항 저장' : '신규 등록'}
          </button>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)',
          background: '#191F28', color: '#fff', fontSize: 13.5, fontWeight: 600,
          padding: '12px 20px', borderRadius: 12, whiteSpace: 'nowrap', zIndex: 20,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

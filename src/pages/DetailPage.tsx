import { useState, useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { openURL, appLogin, partner, tdsEvent, graniteEvent } from '@apps-in-toss/web-framework';
import CheckConfirmIcon from '../assets/icons/icon_check_confirm.svg?react';
import SnackbarCloseIcon from '../assets/icons/icon_close.svg?react';
import { ConfirmDialog } from '@toss/tds-mobile';
import BottomSheet from '../components/BottomSheet';
import ShareSheet from '../components/ShareSheet';
import PhotoReviewPage, { ReviewPhoto } from './PhotoReviewPage';
import WriteReviewPage from './WriteReviewPage';
import { useFavorites } from '../context/FavoritesContext';
import { fetchReviews, type ReviewRow } from '../services/db';

// ── 편의시설 SVG 아이콘 ──────────────────────────────────────
function IcParking() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M19.9831 8.95217H4.01709C2.91209 8.95217 2.01709 9.84717 2.01709 10.9522V20.4992C2.01709 21.0512 2.46509 21.4992 3.01709 21.4992H5.46109C6.01309 21.4992 6.46109 21.0512 6.46109 20.4992V19.1352H17.5391V20.4992C17.5391 21.0512 17.9871 21.4992 18.5391 21.4992H20.9831C21.5351 21.4992 21.9831 21.0512 21.9831 20.4992V10.9512C21.9831 9.84617 21.0891 8.95217 19.9831 8.95217ZM18.0191 13.7152H5.98109C5.59209 13.7152 5.20409 13.3262 5.20409 12.9382C5.20409 12.5502 5.49509 12.1612 5.98109 12.1612H18.1161C18.5051 12.1612 18.8931 12.5502 18.8931 12.9382C18.8931 13.3282 18.5051 13.7152 18.0191 13.7152Z" fill="#333D4B"/>
      <path d="M18.3112 4.52434C18.0202 3.45634 17.0492 2.77734 15.8842 2.77734H8.11718C7.04918 2.77734 6.07918 3.45634 5.69018 4.52434L4.78418 7.45334H19.2162L18.3102 4.52434H18.3112Z" fill="#333D4B"/>
    </svg>
  );
}
function IcPets()        { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.35 3c1.18-.17 2.43 1.12 2.79 2.9.36 1.77-.29 3.35-1.47 3.53-1.17.18-2.43-1.11-2.8-2.89C6.5 4.77 7.17 3.19 8.35 3m7.15 0c1.19.19 1.85 1.77 1.5 3.54-.38 1.78-1.63 3.07-2.81 2.89-1.19-.18-1.84-1.76-1.47-3.53.36-1.78 1.61-3.07 2.78-2.9M3 7.6c1.14-.49 2.69.4 3.5 1.95.76 1.58.5 3.24-.63 3.73s-2.67-.39-3.46-1.96S1.9 8.08 3 7.6m18 0c1.1.48 1.38 2.15.59 3.72s-2.33 2.45-3.46 1.96-1.39-2.15-.63-3.73C18.31 8 19.86 7.11 21 7.6m-1.67 10.78c.04.94-.68 1.98-1.54 2.37-1.79.82-3.91-.88-5.9-.88s-4.13 1.77-5.89.88c-1-.49-1.69-1.79-1.56-2.87.18-1.49 1.97-2.29 3.03-3.38 1.41-1.41 2.41-4.06 4.42-4.06 2 0 3.06 2.61 4.41 4.06 1.11 1.22 2.96 2.25 3.03 3.88"/></svg>; }
function IcTimerOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_hourglass_detail)">
        <path d="M18.7797 18.212C18.7797 16.4258 17.7597 14.7968 16.1529 14.0168L13.2177 12.5918C12.8913 12.4334 12.7551 12.0404 12.9135 11.714C12.9777 11.5814 13.0851 11.4746 13.2177 11.4098L16.1535 9.98478C17.7603 9.20478 18.7797 7.57518 18.7797 5.78958V2.55078H5.21973V5.78958C5.21973 7.57578 6.23973 9.20478 7.84653 9.98478L10.7823 11.4098C11.1087 11.5682 11.2449 11.9612 11.0865 12.2876C11.0223 12.4202 10.9149 12.527 10.7823 12.5918L7.84593 14.0168C6.23913 14.7968 5.21973 16.4264 5.21973 18.212V21.4508H18.7797V18.212Z" fill="#333D4B"/>
        <path d="M18.7804 21.4512H5.21924C4.80524 21.4512 4.46924 21.7872 4.46924 22.2012C4.46924 22.6152 4.80524 22.9512 5.21924 22.9512H18.7804C19.1944 22.9512 19.5304 22.6152 19.5304 22.2012C19.5304 21.7872 19.1944 21.4512 18.7804 21.4512Z" fill="#333D4B"/>
        <path d="M18.7804 2.55078C19.1944 2.55078 19.5304 2.21478 19.5304 1.80078C19.5304 1.38678 19.1944 1.05078 18.7804 1.05078H5.21924C4.80524 1.05078 4.46924 1.38678 4.46924 1.80078C4.46924 2.21478 4.80524 2.55078 5.21924 2.55078H18.7804Z" fill="#333D4B"/>
      </g>
      <defs>
        <clipPath id="clip_hourglass_detail">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}
function IcPublicToilet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_wc_detail)">
        <path d="M17.1001 2.09961H6.9001C4.24913 2.09961 2.1001 4.24864 2.1001 6.89961V17.0996C2.1001 19.7506 4.24913 21.8996 6.9001 21.8996H17.1001C19.7511 21.8996 21.9001 19.7506 21.9001 17.0996V6.89961C21.9001 4.24864 19.7511 2.09961 17.1001 2.09961Z" fill="#333D4B"/>
        <path d="M10.1164 16.5447L11.824 11.7063C11.8802 11.5468 11.8974 11.3762 11.874 11.2087C11.8507 11.0412 11.7875 10.8817 11.6899 10.7437C11.5922 10.6057 11.4629 10.4931 11.3127 10.4153C11.1625 10.3376 10.9959 10.2969 10.8268 10.2969H7.41281C7.24371 10.2969 7.0771 10.3376 6.92693 10.4153C6.77676 10.4931 6.64742 10.6057 6.54975 10.7437C6.45208 10.8817 6.38893 11.0412 6.36559 11.2087C6.34225 11.3762 6.35941 11.5468 6.41561 11.7063L8.12261 16.5447C8.19542 16.7509 8.33039 16.9295 8.50894 17.0558C8.68748 17.1821 8.90081 17.2499 9.11951 17.2499C9.33822 17.2499 9.55154 17.1821 9.73009 17.0558C9.90863 16.9295 10.0436 16.7509 10.1164 16.5447Z" fill="#f3f3f3"/>
        <path d="M13.883 10.8088L12.1754 15.6478C12.1192 15.8072 12.102 15.9778 12.1254 16.1453C12.1487 16.3127 12.2118 16.4722 12.3095 16.6102C12.4072 16.7482 12.5366 16.8607 12.6867 16.9384C12.8369 17.0161 13.0035 17.0566 13.1726 17.0566H16.5866C16.7557 17.0566 16.9223 17.0161 17.0725 16.9384C17.2227 16.8607 17.352 16.7482 17.4497 16.6102C17.5474 16.4722 17.6105 16.3127 17.6339 16.1453C17.6572 15.9778 17.64 15.8072 17.5838 15.6478L15.8768 10.8088C15.804 10.6025 15.669 10.424 15.4905 10.2977C15.3119 10.1713 15.0986 10.1035 14.8799 10.1035C14.6612 10.1035 14.4479 10.1713 14.2693 10.2977C14.0908 10.424 13.9558 10.6025 13.883 10.8088Z" fill="#f3f3f3"/>
        <path d="M9.11959 9.33C9.83204 9.33 10.4096 8.75245 10.4096 8.04C10.4096 7.32755 9.83204 6.75 9.11959 6.75C8.40714 6.75 7.82959 7.32755 7.82959 8.04C7.82959 8.75245 8.40714 9.33 9.11959 9.33Z" fill="#f3f3f3"/>
        <path d="M14.8798 9.33C15.5923 9.33 16.1698 8.75245 16.1698 8.04C16.1698 7.32755 15.5923 6.75 14.8798 6.75C14.1674 6.75 13.5898 7.32755 13.5898 8.04C13.5898 8.75245 14.1674 9.33 14.8798 9.33Z" fill="#f3f3f3"/>
      </g>
      <defs>
        <clipPath id="clip_wc_detail">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}
function IcToilet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M21.9999 21.4273V10.2623C21.9999 6.01431 20.2779 2.57031 18.1539 2.57031H8.44189C9.93189 4.08131 10.8929 6.89231 10.8929 10.2623V21.4273H21.9999Z" fill="#333D4B"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M5.846 12.3143C5.28 12.3143 4.821 11.3963 4.821 10.2633C4.821 9.12931 5.28 8.21131 5.846 8.21131C6.412 8.21131 6.872 9.12931 6.872 10.2633C6.872 11.3963 6.412 12.3143 5.846 12.3143ZM5.846 2.57031C3.722 2.57031 2 6.01431 2 10.2633C2 14.5113 3.722 17.9553 5.846 17.9553C7.971 17.9553 9.693 14.5113 9.693 10.2633C9.693 6.01431 7.971 2.57031 5.846 2.57031Z" fill="#333D4B"/>
    </svg>
  );
}
function IcPeople()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.35 3c1.18-.17 2.43 1.12 2.79 2.9.36 1.77-.29 3.35-1.47 3.53-1.17.18-2.43-1.11-2.8-2.89C6.5 4.77 7.17 3.19 8.35 3m7.15 0c1.19.19 1.85 1.77 1.5 3.54-.38 1.78-1.63 3.07-2.81 2.89-1.19-.18-1.84-1.76-1.47-3.53.36-1.78 1.61-3.07 2.78-2.9M3 7.6c1.14-.49 2.69.4 3.5 1.95.76 1.58.5 3.24-.63 3.73s-2.67-.39-3.46-1.96S1.9 8.08 3 7.6m18 0c1.1.48 1.38 2.15.59 3.72s-2.33 2.45-3.46 1.96-1.39-2.15-.63-3.73C18.31 8 19.86 7.11 21 7.6m-1.67 10.78c.04.94-.68 1.98-1.54 2.37-1.79.82-3.91-.88-5.9-.88s-4.13 1.77-5.89.88c-1-.49-1.69-1.79-1.56-2.87.18-1.49 1.97-2.29 3.03-3.38 1.41-1.41 2.41-4.06 4.42-4.06 2 0 3.06 2.61 4.41 4.06 1.11 1.22 2.96 2.25 3.03 3.88-.03 0-.06-.06-.11.05z"/></svg>; }
function IcCoffee() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.62678 22.087C5.64854 22.3362 5.76288 22.5681 5.94726 22.7372C6.13164 22.9062 6.37266 22.9999 6.62278 23H17.5858C17.8359 22.9999 18.0769 22.9062 18.2613 22.7372C18.4457 22.5681 18.56 22.3362 18.5818 22.087L18.8338 19.193L19.5508 10.969L19.6668 9.631H4.54178L5.62678 22.087ZM20.8038 4.53H19.2068L18.1178 1.666C18.0432 1.47019 17.9109 1.30165 17.7384 1.18271C17.5659 1.06378 17.3613 1.00006 17.1518 1H7.05778C6.62778 1 6.24378 1.265 6.09078 1.666L5.00178 4.53H3.19678C3.06417 4.53 2.93699 4.58268 2.84322 4.67645C2.74946 4.77021 2.69678 4.89739 2.69678 5.03V7.131C2.69678 7.26361 2.74946 7.39079 2.84322 7.48455C2.93699 7.57832 3.06417 7.631 3.19678 7.631H20.8038C20.9364 7.631 21.0636 7.57832 21.1573 7.48455C21.2511 7.39079 21.3038 7.26361 21.3038 7.131V5.03C21.3038 4.89739 21.2511 4.77021 21.1573 4.67645C21.0636 4.58268 20.9364 4.53 20.8038 4.53Z" fill="#333D4B"/>
    </svg>
  );
}
function IcSeat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M7.69094 9.81278V13.0568H16.3139V9.81278C16.3153 8.90112 16.6782 8.02722 17.3231 7.38286C17.9681 6.7385 18.8423 6.37631 19.7539 6.37578H20.0449V6.28478C20.0447 5.19491 19.6115 4.14978 18.8408 3.37922C18.07 2.60866 17.0248 2.17578 15.9349 2.17578H8.07094C6.98107 2.17578 5.93583 2.60866 5.16508 3.37922C4.39434 4.14978 3.9612 5.19491 3.96094 6.28478V6.37578H4.25394C5.16516 6.37684 6.03876 6.73929 6.68309 7.38362C7.32743 8.02796 7.68988 8.90156 7.69094 9.81278Z" fill="#333D4B"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M23.3642 9.46095C23.2122 8.52495 22.5682 7.87695 21.6182 7.87695H20.0482C19.9962 7.87695 19.9492 7.88695 19.8992 7.89195C19.8502 7.88795 19.8012 7.87695 19.7532 7.87695C19.4987 7.87682 19.2466 7.92682 19.0114 8.02409C18.7763 8.12136 18.5625 8.26401 18.3825 8.44387C18.2024 8.62374 18.0596 8.83731 17.9621 9.07239C17.8645 9.30747 17.8143 9.55945 17.8142 9.81395V14.1C17.8143 14.16 17.8026 14.2195 17.7796 14.275C17.7567 14.3305 17.7231 14.3809 17.6806 14.4234C17.6381 14.4659 17.5877 14.4995 17.5322 14.5224C17.4767 14.5454 17.4172 14.5571 17.3572 14.557H6.64816C6.58811 14.5571 6.52862 14.5454 6.47312 14.5224C6.41761 14.4995 6.36718 14.4659 6.32472 14.4234C6.28225 14.3809 6.2486 14.3305 6.22568 14.275C6.20276 14.2195 6.19103 14.16 6.19116 14.1V9.81395C6.19116 8.74395 5.32416 7.87695 4.25516 7.87695C4.20316 7.87695 4.15616 7.88695 4.10616 7.89195C4.05616 7.88795 4.01016 7.87695 3.95916 7.87695H2.38716C1.43716 7.87695 0.788158 8.52495 0.635158 9.46195C0.465158 10.509 0.919158 11.432 1.87116 11.642C1.98968 11.6687 2.0956 11.7349 2.17155 11.8298C2.2475 11.9246 2.28897 12.0424 2.28916 12.164L2.31616 14V18.407C2.31616 18.992 2.79116 19.467 3.37716 19.467H3.96116V20.826C3.96116 21.0912 4.06652 21.3455 4.25405 21.5331C4.44159 21.7206 4.69594 21.826 4.96116 21.826H6.93116C7.19637 21.826 7.45073 21.7206 7.63827 21.5331C7.8258 21.3455 7.93116 21.0912 7.93116 20.826V19.466H16.0762V20.826C16.0762 21.0912 16.1815 21.3455 16.3691 21.5331C16.5566 21.7206 16.8109 21.826 17.0762 21.826H19.0462C19.5972 21.826 20.0462 21.378 20.0462 20.826V19.466H20.6292C20.9103 19.466 21.1799 19.3543 21.3787 19.1555C21.5775 18.9567 21.6892 18.6871 21.6892 18.406V14.001L21.7192 12.165C21.7191 12.0438 21.7603 11.9262 21.8359 11.8316C21.9115 11.7369 22.017 11.6707 22.1352 11.644C23.0872 11.433 23.5352 10.51 23.3652 9.46295" fill="#333D4B"/>
    </svg>
  );
}
function IcOutlet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_plug_detail)">
        <path d="M8.72512 8.01953L7.91992 8.01953L7.91992 2.79113C7.91992 2.68452 7.96228 2.58226 8.03767 2.50688C8.11306 2.43149 8.21531 2.38913 8.32192 2.38913C8.42854 2.38913 8.53079 2.43149 8.60618 2.50688C8.68157 2.58226 8.72392 2.68452 8.72392 2.79113L8.72512 8.01953Z" fill="#333D4B"/>
        <path d="M6.99463 2.79051L6.99463 8.94531L9.65143 8.94531L9.65143 2.79051C9.65143 2.4382 9.51147 2.10032 9.26235 1.85119C9.01323 1.60207 8.67534 1.46211 8.32303 1.46211C7.97072 1.46211 7.63283 1.60207 7.38371 1.85119C7.13459 2.10032 6.99463 2.4382 6.99463 2.79051Z" fill="#333D4B"/>
        <path d="M16.1532 8.01953L15.3486 8.01953L15.3486 2.79113C15.3527 2.68712 15.3968 2.58871 15.4718 2.51655C15.5468 2.44438 15.6468 2.40407 15.7509 2.40407C15.855 2.40407 15.9551 2.44438 16.0301 2.51655C16.1051 2.58871 16.1492 2.68712 16.1532 2.79113L16.1532 8.01953Z" fill="#333D4B"/>
        <path d="M14.4224 2.79051L14.4224 8.94531L17.0798 8.94531L17.0798 2.79051C17.0724 2.44301 16.9291 2.11223 16.6808 1.86907C16.4324 1.62592 16.0986 1.48975 15.7511 1.48975C15.4035 1.48975 15.0697 1.62592 14.8214 1.86907C14.573 2.11223 14.4297 2.44301 14.4224 2.79051Z" fill="#333D4B"/>
        <path d="M19.6537 7.56985L4.42089 7.56985C4.25735 7.56978 4.09539 7.60192 3.94427 7.66445C3.79315 7.72698 3.65583 7.81868 3.54016 7.93429C3.42449 8.04991 3.33273 8.18719 3.27012 8.33828C3.20752 8.48936 3.17529 8.65131 3.17529 8.81485L3.17529 10.9395L20.8987 10.9395L20.8987 8.81485C20.8987 8.65136 20.8665 8.48946 20.8039 8.33841C20.7414 8.18736 20.6496 8.05011 20.534 7.93451C20.4184 7.8189 20.2812 7.72719 20.1301 7.66462C19.9791 7.60206 19.8172 7.56985 19.6537 7.56985Z" fill="#333D4B"/>
        <path d="M15.1051 22.4629L8.96949 22.4629C8.72866 22.463 8.49304 22.3928 8.29157 22.2608C8.09011 22.1289 7.93159 21.9409 7.83549 21.7201L3.17529 10.9399L20.8987 10.9399L16.2385 21.7201C16.1425 21.9409 15.9841 22.1288 15.7827 22.2608C15.5814 22.3927 15.3458 22.463 15.1051 22.4629Z" fill="#333D4B"/>
      </g>
      <defs>
        <clipPath id="clip_plug_detail">
          <rect width="24" height="24" fill="white" transform="translate(1.04907e-06 24) rotate(-90)"/>
        </clipPath>
      </defs>
    </svg>
  );
}

// ────────── 타입 ────────────────────────────────────────────
type DayKey = '월' | '화' | '수' | '목' | '금' | '토' | '일';

interface BusinessHour {
  open: string;
  close: string;
}

interface ReviewItem {
  id: string;
  author: string;
  avatarColor: string;
  date: string;
  content: string;
  images?: string[];      // gradient 문자열 배열 (플레이스홀더)
  isReporter?: boolean;   // 카페 제보자 여부 → 항상 최상단
  likeCount?: number;     // 좋아요 수
}

interface CafeDetailData {
  id: string;
  name: string;
  address: string;
  distance?: number;
  photos?: string[];
  hours: Partial<Record<DayKey, BusinessHour | null>>;
  regularHoliday: DayKey[];
  seats?: string;
  outlets?: string;
  vibe?: string;
  priceRange?: string;
  phone?: string;
  snsUrl?: string;
  amenities: Partial<Record<
    'parking' | 'pets' | 'noTimeLimit' | 'separateRestroom' | 'indoorRestroom' | 'groupVisit' | 'decafFree',
    boolean
  >>;
  reviews: ReviewItem[];
}

// ────────── 상수 ────────────────────────────────────────────
const DAY_ORDER: DayKey[] = ['월', '화', '수', '목', '금', '토', '일'];
const JS_TO_KR: DayKey[] = ['일', '월', '화', '수', '목', '금', '토'];

/** 카페 분위기를 연상시키는 다크 그라디언트 플레이스홀더 */
const PHOTO_BG = [
  'linear-gradient(145deg,#1C1C1E 0%,#2C2C2E 100%)',
  'linear-gradient(145deg,#1a1a2e 0%,#2d2d44 100%)',
  'linear-gradient(145deg,#2d1b0e 0%,#4e3020 100%)',
  'linear-gradient(145deg,#0f2530 0%,#1a3d50 100%)',
  'linear-gradient(145deg,#1e1e1e 0%,#3a3a3a 100%)',
  'linear-gradient(145deg,#1a2a1a 0%,#2d4a2d 100%)',
  'linear-gradient(145deg,#2a1a2a 0%,#4a2a4a 100%)',
  'linear-gradient(145deg,#2d2200 0%,#4a3800 100%)',
];

const AMENITY_CONFIG: Record<string, { icon: ReactNode; label: string }> = {
  parking:          { icon: <IcParking />,      label: '주차' },
  pets:             { icon: <IcPets />,          label: '반려동물 동반' },
  noTimeLimit:      { icon: <IcTimerOff />,      label: '시간 제한 없음' },
  separateRestroom: { icon: <IcPublicToilet />,  label: '남/녀 화장실 구분' },
  indoorRestroom:   { icon: <IcToilet />,        label: '내부화장실' },
  groupVisit:       { icon: <IcPeople />,        label: '단체 방문 가능' },
  decafFree:        { icon: <IcCoffee />,        label: '디카페인 무료' },
};

// ────────── 목업 데이터 ──────────────────────────────────────
const MOCK_DETAILS: Record<string, CafeDetailData> = {
  default: {
    id: 'default',
    name: '무모아',
    address: '서울 강남구 논현로 508',
    distance: 20,
    photos: [
      'https://picsum.photos/seed/cafe-a/300/300',
      'https://picsum.photos/seed/cafe-b/300/300',
      'https://picsum.photos/seed/cafe-c/300/300',
      'https://picsum.photos/seed/cafe-d/300/300',
    ],
    hours: {
      월: { open: '09:00', close: '22:00' },
      화: { open: '09:00', close: '22:00' },
      수: { open: '09:00', close: '22:00' },
      목: { open: '09:00', close: '22:00' },
      금: { open: '09:00', close: '23:00' },
      토: { open: '10:00', close: '23:00' },
      일: null,
    },
    regularHoliday: ['일'],
    seats: '여유로워요',
    outlets: '적당해요',
    vibe: '조용한, 모던한',
    priceRange: '4,500원',
    phone: '0507-2881-1679',
    snsUrl: 'https://www.instagram.com/mumoa_cafe',
    amenities: {
      parking: true,
      noTimeLimit: true,
      separateRestroom: true,
      indoorRestroom: true,
      decafFree: true,
    },
    reviews: [
      {
        id: 'r_reporter',
        author: '카공러버',
        avatarColor: '#252525',
        date: '2024.11.20',
        content: '직접 제보한 카페예요! 서울 강남 최고의 카공 카페입니다. 콘센트가 모든 자리에 있고 조용한 편이에요. 커피도 맛있고 직원분들도 친절해서 자주 올 것 같아요. 2층 창가 자리 추천드려요 :)',
        images: [PHOTO_BG[0], PHOTO_BG[1], PHOTO_BG[2]],
        isReporter: true,
        likeCount: 12,
      },
      {
        id: 'r4',
        author: '김지훈',
        avatarColor: '#60A5FA',
        date: '2024.12.01',
        content: '조용하고 깔끔한 카페예요. 오래 앉아 있어도 눈치 안 보이고, 콘센트도 넉넉해서 노트북 작업하기에 딱이에요. 재방문 의사 100%입니다.',
        likeCount: 2,
      },
      {
        id: 'r5',
        author: '윤혜원',
        avatarColor: '#FB7185',
        date: '2024.11.28',
        content: '혼자 공부하러 왔는데 분위기가 정말 좋았어요. 음악도 잔잔하고 너무 시끄럽지 않아서 집중하기에 딱이었어요. 디카페인 옵션이 있어서 저 같은 카페인 예민한 분들께도 추천드려요!',
        likeCount: 4,
      },
      {
        id: 'r1',
        author: '조은유',
        avatarColor: '#A78BFA',
        date: '2024.12.15',
        content: '카페 분위기가 너무 좋아요. 조용하고 집중이 잘 되는 공간이에요. 커피도 맛있고 콘센트도 충분해서 자주 방문할 것 같아요!',
        images: [PHOTO_BG[3], PHOTO_BG[4]],
        likeCount: 5,
      },
      {
        id: 'r2',
        author: '이민준',
        avatarColor: '#34D399',
        date: '2024.12.10',
        content: '콘센트도 충분하고 자리도 넓어서 카공하기 딱 좋아요!',
        images: [PHOTO_BG[6], PHOTO_BG[7]],
        likeCount: 3,
      },
      {
        id: 'r3',
        author: '박서연',
        avatarColor: '#F59E0B',
        date: '2024.12.08',
        content: '분위기는 좋은데 주말에는 좀 붐벼요. 평일 오전에 오시면 정말 여유롭게 공부할 수 있어요. 아메리카노 맛도 기대 이상이에요.',
        images: [PHOTO_BG[5]],
        likeCount: 7,
      },
    ],
  },
};

// 이름·주소만 다르고 나머지는 default 템플릿을 공유하는 카페 목록
const CAFE_NAME_MAP: Record<string, { name: string; address: string }> = {
  // MyPage - MOCK_REPORTED
  r1:  { name: '우모에',          address: '서울 용산구 한강대로84길 21-17 1층' },
  r2:  { name: '본지르본 연희',   address: '서울 서대문구 연희로 93-10' },
  r3:  { name: '카페 온도',       address: '서울 마포구 와우산로 21' },
  r4:  { name: '모노 커피',       address: '서울 강남구 언주로 234' },
  // MyPage - MOCK_RECENT
  rc1: { name: '블루보틀 강남',   address: '서울 강남구 논현로 508' },
  rc2: { name: '스타벅스 역삼역점', address: '서울 강남구 역삼로 123' },
  rc3: { name: '우모에',          address: '서울 용산구 한강대로84길 21-17 1층' },
  rc4: { name: '더 로스터리',     address: '서울 강남구 도곡로 321' },
  rc5: { name: '카페 베이커리',   address: '서울 강남구 역삼동 567' },
  // MapPage - MOCK_CAFES (cafeId)
  '1': { name: '블루보틀 강남',      address: '서울 강남구 논현로 508' },
  '2': { name: '스타벅스 역삼역점',  address: '서울 강남구 역삼로 123' },
  '3': { name: '모노 커피',          address: '서울 강남구 언주로 234' },
  '4': { name: '카페 베이커리',      address: '서울 강남구 역삼동 567' },
  '5': { name: '브런치 팩토리',      address: '서울 강남구 선릉로 890' },
  '6': { name: '더 로스터리',        address: '서울 강남구 도곡로 321' },
  // GuidebookPage - FEATURE_STORES
  gs1: { name: '도트커피',        address: '서울 영등포구' },
  gs2: { name: '프릳츠 커피',     address: '서울 마포구' },
  gs3: { name: '어니언',          address: '서울 성동구' },
  gs4: { name: '오르에르',        address: '서울 강남구' },
  gs5: { name: '스탠딩커피',      address: '경기 성남시' },
};

// ─── 리뷰 없는 카페 목록 (reviews: [] 처리) ─────────────────────
const EMPTY_REVIEW_CAFE_IDS = new Set(['gs5']);

function getCafeDetail(cafeId: string): CafeDetailData {
  if (MOCK_DETAILS[cafeId]) return MOCK_DETAILS[cafeId];
  const meta = CAFE_NAME_MAP[cafeId];
  const base = meta
    ? { ...MOCK_DETAILS['default'], id: cafeId, name: meta.name, address: meta.address }
    : { ...MOCK_DETAILS['default'], id: cafeId };
  if (EMPTY_REVIEW_CAFE_IDS.has(cafeId)) return { ...base, reviews: [] };
  return base;
}

// ────────── 유틸 함수 ────────────────────────────────────────
function getTodayKey(): DayKey {
  return JS_TO_KR[new Date().getDay()];
}

function getStatusInfo(cafe: CafeDetailData): { label: string; color: string } {
  const today = getTodayKey();
  const h = cafe.hours[today];
  if (cafe.regularHoliday.includes(today) || h === null || h === undefined) {
    return { label: '휴무', color: '#8B95A1' };
  }
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = h.open.split(':').map(Number);
  const [ch, cm] = h.close.split(':').map(Number);
  const open = oh * 60 + om;
  const close = ch * 60 + cm;
  if (cur < open - 30) return { label: '영업 종료', color: '#8B95A1' };
  if (cur < open) return { label: '준비 중', color: '#F59E0B' };
  if (cur >= close) return { label: '영업 종료', color: '#8B95A1' };
  return { label: '영업 중', color: '#00B493' };
}

// ────────── 아이콘 컴포넌트 ──────────────────────────────────


function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M19.0998 8.30078H17.4998V10.7008H19.0998C19.7998 10.7008 20.2998 11.2008 20.2998 11.9008V19.1008C20.2998 19.8008 19.7998 20.3008 19.0998 20.3008H11.8998C11.1998 20.3008 10.6998 19.8008 10.6998 19.1008V17.7008H8.2998V19.1008C8.2998 21.1008 9.8998 22.7008 11.8998 22.7008H19.0998C21.0998 22.7008 22.6998 21.1008 22.6998 19.1008V11.9008C22.6998 9.90078 21.0998 8.30078 19.0998 8.30078Z" fill="#6B7684"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M4.8998 3.70078C4.1998 3.70078 3.6998 4.20078 3.6998 4.90078V12.1008C3.6998 12.8008 4.1998 13.3008 4.8998 13.3008H12.0998C12.7998 13.3008 13.2998 12.8008 13.2998 12.1008V4.90078C13.2998 4.20078 12.7998 3.70078 12.0998 3.70078H4.8998ZM12.0998 15.7008H4.8998C2.8998 15.7008 1.2998 14.1008 1.2998 12.1008V4.90078C1.2998 2.90078 2.8998 1.30078 4.8998 1.30078H12.0998C14.0998 1.30078 15.6998 2.90078 15.6998 4.90078V12.1008C15.6998 14.1008 14.0998 15.7008 12.0998 15.7008Z" fill="#6B7684"/>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M20.5609 14.0198C19.9539 14.0198 19.4609 14.5118 19.4609 15.1198V18.1628C19.4609 18.8788 18.8779 19.4628 18.1609 19.4628H5.83789C5.12089 19.4628 4.53789 18.8788 4.53789 18.1628V5.83984C4.53789 5.12284 5.12089 4.53984 5.83789 4.53984H8.87789C9.48589 4.53984 9.97789 4.04784 9.97789 3.43984C9.97789 2.83184 9.48589 2.33984 8.87789 2.33984H5.83789C3.90889 2.33984 2.33789 3.90984 2.33789 5.83984V18.1628C2.33789 20.0928 3.90889 21.6628 5.83789 21.6628H18.1609C20.0909 21.6628 21.6609 20.0928 21.6609 18.1628V15.1198C21.6609 14.5118 21.1689 14.0198 20.5609 14.0198Z" fill="#6B7684"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M21.3388 2.64182C21.1088 2.41782 20.8058 2.32282 20.5078 2.33982H13.1608C12.5528 2.33982 12.0608 2.83182 12.0608 3.43982C12.0608 4.04782 12.5528 4.53982 13.1608 4.53982H17.9048L11.4128 11.0318C11.2058 11.2378 11.0898 11.5178 11.0908 11.8098C11.0908 12.4168 11.5838 12.9098 12.1908 12.9098H12.1918C12.4838 12.9098 12.7628 12.7948 12.9688 12.5878L19.4608 6.09482V10.8398C19.4608 11.4478 19.9528 11.9398 20.5608 11.9398C21.1688 11.9398 21.6608 11.4478 21.6608 10.8398V3.46882C21.6718 3.16982 21.5698 2.86782 21.3378 2.64182H21.3388Z" fill="#6B7684"/>
    </svg>
  );
}

// ────────── (NavBar icon helpers removed) ─────────────────────

// ────────── 서브 컴포넌트 ────────────────────────────────────
function Divider() {
  return <div style={{ height: 8, background: '#F2F4F6' }} />;
}

function InfoBox({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div style={{ flex: 1, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4, color: '#8B95A1' }}>
        {icon}
        <p style={{ fontSize: 12, color: '#8B95A1' }}>{label}</p>
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#191F28' }}>{value}</p>
    </div>
  );
}

function InfoRow({
  label, value, onCopy, isLink,
}: {
  label: string;
  value?: string;
  onCopy?: () => void;
  isLink?: boolean;
}) {
  const displayValue = value ?? '?';

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #F3F3F3',
    }}>
      <span style={{ fontSize: 14, color: '#8B95A1', width: 60, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        {isLink && value ? (
          <button
            onClick={() => openURL(value)}
            style={{ fontSize: 14, color: '#252525', textDecoration: 'none',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'right' }}
          >
            {value}
          </button>
        ) : (
          <span style={{ fontSize: 14, color: value ? '#191F28' : '#B0B8C1',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
            {displayValue}
          </span>
        )}
        {isLink && value && (
          <button onClick={() => openURL(value)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}><LinkIcon /></button>
        )}
        {onCopy && value && (
          <button onClick={onCopy} style={{ flexShrink: 0, padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
            <CopyIcon />
          </button>
        )}
      </div>
    </div>
  );
}

function AmenityBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div style={{
      width: 50, height: 50,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 3,
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 500, color: '#4E5968', textAlign: 'center', lineHeight: 1.2, display: 'block', minHeight: 24 }}>{label}</span>
    </div>
  );
}

// ── 포토 플레이스홀더 셀 ─────────────────────────────────────
function PhotoCell({
  bg, size = 80, radius = 8, label,
}: {
  bg: string; size?: number | string; radius?: number; label?: string;
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: bg, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <span style={{ fontSize: typeof size === 'number' ? size * 0.28 : 22, opacity: 0.18 }}>☕</span>
      {label && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
        }}>
          <span style={{ fontSize: 18, color: 'white', fontWeight: 700 }}>{label}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>더보기</span>
        </div>
      )}
    </div>
  );
}

// ── 포토 모아보기 (리뷰 섹션 상단) ──────────────────────────
function PhotoMosaic({
  allPhotos,
  maxVisible = 6,
  onMore,
}: {
  allPhotos: string[];
  maxVisible?: number;
  onMore?: () => void;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (allPhotos.length === 0) return null;

  const visible = allPhotos.slice(0, maxVisible);
  const remaining = allPhotos.length - maxVisible;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* 확장 뷰 */}
      {expandedIdx !== null && (
        <div style={{
          width: '100%', aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden',
          background: allPhotos[expandedIdx],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', marginBottom: 8,
        }}>
          <span style={{ fontSize: 60, opacity: 0.15 }}>☕</span>
          <button
            onClick={() => setExpandedIdx(null)}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 30, height: 30, borderRadius: 15,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 15,
            }}
          >✕</button>
        </div>
      )}

      {/* 썸네일 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 3,
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {visible.map((bg, i) => {
          const isLastSlot = i === maxVisible - 1 && remaining > 0;
          return (
            <div
              key={i}
              onClick={() => isLastSlot ? onMore?.() : setExpandedIdx(i)}
              style={{
                aspectRatio: '1 / 1',
                background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              <span style={{ fontSize: 22, opacity: 0.18 }}>☕</span>
              {/* 선택된 사진 하이라이트 */}
              {expandedIdx === i && !isLastSlot && (
                <div style={{
                  position: 'absolute', inset: 0,
                  boxShadow: 'inset 0 0 0 3px #252525',
                }} />
              )}
              {/* 마지막 슬롯 더보기 오버레이 */}
              {isLastSlot && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.55)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 2,
                }}>
                  <span style={{ fontSize: 20, color: 'white', fontWeight: 700, lineHeight: 1 }}>
                    +{remaining}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>더보기</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 리뷰 카드 (강화) ─────────────────────────────────────────
function ReviewCard({ review }: { review: ReviewItem }) {
  const [textExpanded, setTextExpanded] = useState(false);
  const [expandedImgIdx, setExpandedImgIdx] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(review.likeCount ?? 0);
  const CONTENT_THRESHOLD = 50; // 띄어쓰기 포함 50자
  const isLong = review.content.length > CONTENT_THRESHOLD;

  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid #F2F4F6' }}>

      {/* 헤더: 아바타 + 닉네임 + 날짜 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 100,
          background: review.avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1, textAlign: 'center' }}>
            {review.author[0]}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#000000' }}>
              {review.author}
            </span>
            {review.isReporter && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#252525',
                background: '#EBEBEB', borderRadius: 4, padding: '2px 6px',
                lineHeight: 1.4,
              }}>
                카페 제보자
              </span>
            )}
          </div>
          <span style={{ fontSize: 12, color: '#777777' }}>{review.date}</span>
        </div>
      </div>

      {/* 첨부 이미지 – 확장 뷰 */}
      {expandedImgIdx !== null && review.images && (
        <div style={{
          width: 343, maxWidth: '100%', aspectRatio: '4/3',
          background: review.images[expandedImgIdx],
          borderRadius: 10, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', marginBottom: 10,
        }}>
          <span style={{ fontSize: 50, opacity: 0.15 }}>☕</span>
          <button
            onClick={() => setExpandedImgIdx(null)}
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 28, height: 28, borderRadius: 14,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 13,
            }}
          >✕</button>
        </div>
      )}

      {/* 첨부 이미지 – 썸네일 가로 스크롤 */}
      {expandedImgIdx === null && review.images && review.images.length > 0 && (
        <div style={{
          display: 'flex', gap: 6, marginBottom: 10,
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {review.images.map((bg, i) => (
            <div key={i} onClick={() => setExpandedImgIdx(i)} style={{ cursor: 'pointer' }}>
              <PhotoCell bg={bg} size={80} radius={8} />
            </div>
          ))}
        </div>
      )}

      {/* 리뷰 텍스트 (50자 말줄임 → 더보기 탭 시 전체 펼침) */}
      <div>
        <p style={{
          fontSize: 14, color: '#000000', lineHeight: 1.65, marginBottom: isLong ? 4 : 0,
          ...(textExpanded ? {} : {
            display: '-webkit-box' as any,
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as any,
            overflow: 'hidden',
          }),
        }}>
          {review.content}
        </p>
        {isLong && (
          <button
            onClick={() => setTextExpanded(e => !e)}
            style={{ fontSize: 13, color: '#B0B8C1', fontWeight: 500 }}
          >
            {textExpanded ? '접기' : '더보기'}
          </button>
        )}
      </div>

      {/* 우측 하단 좋아요 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          onClick={() => {
            setLiked(l => {
              setLikeCount(c => l ? c - 1 : c + 1);
              return !l;
            });
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            width: liked ? 44 : 46, height: 29, borderRadius: 13,
            background: liked ? '#EBEBEB' : '#FAFAFB',
            border: 'none',
            justifyContent: 'center', flexShrink: 0,
            transition: 'background 0.15s, width 0.15s',
            boxSizing: 'border-box', padding: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M10.9038 21.2884C11.5698 21.7284 12.4288 21.7284 13.0938 21.2884C15.2088 19.8924 19.8138 16.5554 21.7978 12.8214C24.4128 7.89542 21.3418 2.98242 17.2818 2.98242C14.9678 2.98242 13.5758 4.19142 12.8058 5.23042C12.4818 5.67542 11.8588 5.77442 11.4128 5.45042C11.3278 5.38942 11.2538 5.31442 11.1928 5.23042C10.4228 4.19142 9.03076 2.98242 6.71676 2.98242C2.65676 2.98242 -0.414244 7.89542 2.20176 12.8214C4.18376 16.5554 8.79076 19.8924 10.9038 21.2884Z" fill={liked ? '#252525' : '#D1D6DB'}/>
          </svg>
          <span style={{
            fontSize: 13, fontWeight: 600, lineHeight: 1,
            color: liked ? '#252525' : '#697482',
            letterSpacing: -0.3,
          }}>
            {likeCount}
          </span>
        </button>
      </div>
    </div>
  );
}

// ────────── 카카오맵 웹 URL 생성 ─────────────────────────────
// SDK 규정: 앱 딥링크(kakaomap://) 사용 금지 → 타사 웹사이트 URL(https://)만 허용
// openURL()로 카카오맵 웹에서 장소 검색 결과를 열어요.
function openKakaoMapWeb(cafe: CafeDetailData) {
  const query = encodeURIComponent(`${cafe.name} ${cafe.address}`);
  openURL(`https://map.kakao.com/link/search/${query}`);
}

// MorePopup — 배포 시 네이티브 바텀시트로 대체 예정

// ────────── 바텀시트: 로그인 유도 ────────────────────────────
function LoginPromptSheet({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet isOpen onClose={onClose}>
      <div style={{ padding: '8px 20px 0', paddingBottom: 'max(32px, env(safe-area-inset-bottom))', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>💙</div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#191F28', marginBottom: 8 }}>로그인이 필요해요</p>
        <p style={{ fontSize: 14, color: '#6B7684', marginBottom: 24, lineHeight: 1.5 }}>
          즐겨찾기를 사용하려면<br />로그인이 필요해요
        </p>
        <button
          onClick={async () => {
            try {
              await appLogin();
              onClose();
            } catch { /* 사용자 취소 무시 */ }
          }}
          style={{
            width: '100%', height: 52, borderRadius: 12,
            background: '#252525', color: 'white',
            fontSize: 16, fontWeight: 700,
          }}
        >
          토스로 로그인
        </button>
        <button
          onClick={onClose}
          style={{ marginTop: 12, fontSize: 14, color: '#8B95A1' }}
        >
          다음에 할게요
        </button>
      </div>
    </BottomSheet>
  );
}

// ────────── 즐겨찾기 스낵바 ──────────────────────────────────
// Figma: detail_favorite_success / detail_favorite_cancel
// bg=#8b95a1, h=59, r=9999, 가운데 정렬, bottom=76px

function FavoriteSnackbar({
  type, dissolving,
}: {
  type: 'added' | 'removed' | null;
  dissolving: boolean;
}) {
  const visible = type !== null;

  if (type === 'added') {
    return (
      <div style={{
        position: 'fixed', bottom: 76, left: '50%',
        transform: `translateX(-50%) translateY(${visible && !dissolving ? 0 : 12}px)`,
        opacity: dissolving ? 0 : visible ? 1 : 0,
        transition: dissolving ? 'opacity 0.7s ease, transform 0.7s ease' : 'opacity 0.25s, transform 0.25s',
        width: 'fit-content', height: 59, borderRadius: 9999,
        background: '#FDFDFE',
        display: 'flex', alignItems: 'center',
        paddingLeft: 16, paddingRight: 16, gap: 12,
        zIndex: 300, pointerEvents: visible ? 'auto' : 'none',
        boxSizing: 'border-box',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}>
        <div style={{ width: 24, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckConfirmIcon width={24} height={24} />
        </div>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 590, color: '#001936', whiteSpace: 'nowrap' }}>
          카페를 모음집에 담았어요
        </span>
      </div>
    );
  }

  if (type === 'removed') {
    return (
      <div style={{
        position: 'fixed', bottom: 76, left: '50%',
        transform: `translateX(-50%) translateY(${visible && !dissolving ? 0 : 12}px)`,
        opacity: dissolving ? 0 : visible ? 1 : 0,
        transition: dissolving ? 'opacity 0.7s ease, transform 0.7s ease' : 'opacity 0.25s, transform 0.25s',
        width: 'fit-content', height: 59, borderRadius: 9999,
        background: '#FDFDFE',
        display: 'flex', alignItems: 'center',
        paddingLeft: 16, paddingRight: 16, gap: 12,
        zIndex: 300, pointerEvents: visible ? 'auto' : 'none',
        boxSizing: 'border-box',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}>
        <div style={{ width: 24, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SnackbarCloseIcon width={24} height={24} />
        </div>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 590, color: '#001936', whiteSpace: 'nowrap' }}>
          카페를 모음집에서 꺼냈어요
        </span>
      </div>
    );
  }

  return null;
}

// ────────── 복사 완료 토스트 ─────────────────────────────────
function CopyToast({ visible }: { visible: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 8}px)`,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.2s, transform 0.2s',
      background: '#191F28', color: 'white',
      borderRadius: 8, padding: '8px 16px',
      fontSize: 13, fontWeight: 500,
      zIndex: 200, pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }}>
      전화번호가 복사됐어요
    </div>
  );
}

// ────────── 탭바 아이콘 ──────────────────────────────────────
function NavHomeIcon()       { return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>; }
function NavGuideIcon()      { return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>; }
function NavCollectionIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>; }
function NavMypageIcon()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>; }

const DETAIL_TABS = [
  { id: 'home',       label: '홈',     icon: <NavHomeIcon /> },
  { id: 'guidebook',  label: '가이드북', icon: <NavGuideIcon /> },
  { id: 'collection', label: '모음집',  icon: <NavCollectionIcon /> },
  { id: 'mypage',     label: '마이',   icon: <NavMypageIcon /> },
] as const;

// ────────── 메인 컴포넌트 ────────────────────────────────────
interface DetailPageProps {
  cafeId: string;
  onBack: () => void;
  onClose: () => void;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  scrollToReview?: boolean;
  openDirections?: boolean;
  onGoToCollection?: (collection: { id: string; name: string }) => void;
}

// 아바타 색상 (user_id 기반 고정 색)
const AVATAR_COLORS = ['#3182F6','#F04452','#00C471','#FF8C00','#9B59B6','#1ABC9C'];
function avatarColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
function rowToReviewItem(row: ReviewRow): ReviewItem {
  return {
    id: row.id,
    author: `사용자 ${row.user_id.slice(-4)}`,
    avatarColor: avatarColor(row.user_id),
    date: formatDate(row.created_at),
    content: row.content,
    images: row.images ?? [],
    likeCount: row.like_count,
  };
}

export default function DetailPage({ cafeId, onBack, onClose, activeTab = 'home', onTabChange, scrollToReview, openDirections }: DetailPageProps) {
  const cafe = getCafeDetail(cafeId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reviewSectionRef = useRef<HTMLDivElement>(null);
  const cafeInfoRef = useRef<HTMLDivElement>(null);
  const { isFavorited, addFavorite, removeFavorite, addRecentlyViewed, userId } = useFavorites();

  // ── DB 리뷰 로딩 ──────────────────────────────────────────
  const [dbReviews, setDbReviews] = useState<ReviewItem[]>([]);
  const loadReviews = useCallback(async () => {
    const rows = await fetchReviews(cafeId);
    setDbReviews(rows.map(rowToReviewItem));
  }, [cafeId]);
  useEffect(() => { loadReviews(); }, [loadReviews]);

  const reviews = dbReviews.length > 0 ? dbReviews : cafe.reviews;

  const [scrolled, setScrolled] = useState(false);

  // 상세 화면 진입 시 최근 본 카페에 추가
  useEffect(() => {
    addRecentlyViewed({
      id: cafe.id,
      name: cafe.name,
      photo: cafe.photos?.[0] ?? '',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 공통 내비게이션 백버튼 → onBack 연결
  useEffect(() => {
    try {
      return graniteEvent.addEventListener('backEvent', {
        onEvent: () => onBack(),
        onError: (err) => console.error(err),
      });
    } catch { return undefined; }
  }, [onBack]);

  // 리뷰 섹션으로 자동 스크롤
  useEffect(() => {
    if (scrollToReview && reviewSectionRef.current && scrollRef.current) {
      setTimeout(() => {
        reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [hoursExpanded, setHoursExpanded] = useState(false);
  const [isLoggedIn] = useState(true); // mock: 로그인 상태 (Supabase 연동 전 임시)

  // showMoreSheet — 배포 시 바텀시트 연결 예정
  const [showLoginSheet, setShowLoginSheet] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showUnfavoriteDialog, setShowUnfavoriteDialog] = useState(false);

  // 가이드북 길찾기 버튼에서 진입 시 카카오맵 웹 바로 열기
  useEffect(() => {
    if (openDirections) {
      setTimeout(() => openKakaoMapWeb(cafe), 150);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [heroIdx, setHeroIdx] = useState(0);
  const heroScrollRef = useRef<HTMLDivElement>(null);

  // ── 네비바 하트 아이콘 (카페 상세페이지 전용) ──────────────
  const heartHandlerRef = useRef<() => void>(() => {});
  heartHandlerRef.current = () => {
    if (isFavorited(cafeId)) {
      setShowUnfavoriteDialog(true);
    } else {
      addFavorite({
        id: cafe.id,
        name: cafe.name,
        address: cafe.address,
        rating: 0,
        reviewCount: cafe.reviews.length,
        photos: cafe.photos ?? [],
      });
      showFavoriteSnackbar('added');
    }
  };
  useEffect(() => {
    try {
      partner.addAccessoryButton({ id: 'heart', title: '하트', icon: { name: 'icon-heart-mono' } });
      const cleanup = tdsEvent.addEventListener('navigationAccessoryEvent', {
        onEvent: ({ id }: { id: string }) => { if (id === 'heart') heartHandlerRef.current(); },
        onError: () => {},
      });
      return () => {
        try { partner.removeAccessoryButton(); } catch { /* noop */ }
        cleanup?.();
      };
    } catch {
      return undefined;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [showPhotoReview, setShowPhotoReview] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviewSort, setReviewSort] = useState<'최신순' | '추천순' | '포토리뷰'>('최신순');
  const [reviewSortPopupOpen, setReviewSortPopupOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [favoriteSnackbar, setFavoriteSnackbar] = useState<'added' | 'removed' | null>(null);
  const [snackbarDissolving, setSnackbarDissolving] = useState(false);
  const snackbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dissolveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFavorite = isFavorited(cafeId);

  const { label: statusLabel, color: statusColor } = getStatusInfo(cafe);
  const todayKey = getTodayKey();

  const handleScroll = () => {
    if (scrollRef.current && cafeInfoRef.current) {
      const containerTop = scrollRef.current.getBoundingClientRect().top;
      const infoBottom = cafeInfoRef.current.getBoundingClientRect().bottom;
      setScrolled(infoBottom <= containerTop);
    }
  };

  const showFavoriteSnackbar = (type: 'added' | 'removed') => {
    // 기존 타이머 초기화
    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    if (dissolveTimerRef.current) clearTimeout(dissolveTimerRef.current);
    // 즉시 표시
    setSnackbarDissolving(false);
    setFavoriteSnackbar(type);
    // 3초 후 dissolve 시작 → 0.7s 후 완전히 제거
    snackbarTimerRef.current = setTimeout(() => {
      setSnackbarDissolving(true);
      dissolveTimerRef.current = setTimeout(() => {
        setFavoriteSnackbar(null);
        setSnackbarDissolving(false);
      }, 700);
    }, 3000);
  };

  const handleFavorite = () => {
    if (!isLoggedIn) { setShowLoginSheet(true); return; }
    if (isFavorite) {
      setShowUnfavoriteDialog(true);
    } else {
      addFavorite({
        id: cafe.id,
        name: cafe.name,
        address: cafe.address,
        rating: 5,        // 나중에 Supabase 연동 시 실제 값으로 교체
        reviewCount: 0,   // 나중에 Supabase 연동 시 실제 값으로 교체
        badge: cafe.amenities.noTimeLimit ? '시간 제한 없음' : undefined,
        photos: cafe.photos ?? [],
      });
      showFavoriteSnackbar('added');
    }
  };

  const handleConfirmUnfavorite = () => {
    removeFavorite(cafeId);
    showFavoriteSnackbar('removed');
    setShowUnfavoriteDialog(false);
  };

  const handleShare = () => { setShowShareSheet(true); };
  void handleShare; // 배포 시 MorePopup 연결 예정

  const handleCopyPhone = async () => {
    if (!cafe.phone) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(cafe.phone);
      } else {
        // fallback for WebView environments without Clipboard API
        const el = document.createElement('textarea');
        el.value = cafe.phone;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopyToastVisible(true);
      setTimeout(() => setCopyToastVisible(false), 2000);
    } catch { /* ignore */ }
  };

  // 편의시설 목록 (보유 시설만)
  const activeAmenities = Object.entries(AMENITY_CONFIG)
    .filter(([key]) => cafe.amenities[key as keyof typeof cafe.amenities] === true);
  const hasAmenities = activeAmenities.length > 0;

  // 리뷰 정렬
  const sortedReviews = (() => {
    const reporters = reviews.filter(r => r.isReporter);
    const rest = reviews.filter(r => !r.isReporter);
    if (reviewSort === '추천순') {
      return [...reporters, ...rest.slice().sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))];
    }
    // 최신순 (기본): 제보자 최상단, 나머지 기본 순서
    return [...reporters, ...rest];
  })();

  // 포토 모아보기: 모든 리뷰 이미지 수집 (제보자 리뷰 사진 먼저)
  const allReviewPhotos = sortedReviews.flatMap(r => r.images ?? []);

  // PhotoReviewPage용 ReviewPhoto[] (각 사진에 리뷰 메타데이터 포함)
  const allReviewPhotosFull: ReviewPhoto[] = sortedReviews.flatMap(r =>
    (r.images ?? []).map(bg => ({
      bg,
      reviewId: r.id,
      reviewAuthor: r.author,
      reviewAvatarColor: r.avatarColor,
      reviewDate: r.date,
      reviewContent: r.content,
      isReporter: r.isReporter ?? false,
    }))
  );

  // 오늘 영업시간
  const todayHours = cafe.hours[todayKey];
  const hasHoursData = todayHours !== undefined;

  // 리뷰 남기기 페이지
  if (showWriteReview) {
    return (
      <WriteReviewPage
        cafe={{ name: cafe.name, address: cafe.address }}
        cafeId={cafeId}
        userId={userId}
        onBack={() => setShowWriteReview(false)}
        onClose={onClose}
        onReviewSubmitted={() => { setShowWriteReview(false); loadReviews(); }}
      />
    );
  }

  // 포토리뷰 전체보기 페이지
  if (showPhotoReview) {
    return (
      <PhotoReviewPage
        photos={allReviewPhotosFull}
        cafeName={cafe.name}
        isFavorite={isFavorite}
        onFavoriteToggle={handleFavorite}
        onBack={() => setShowPhotoReview(false)}
        onClose={onClose}
      />
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#f3f3f3' }}>


      {/* ── 스크롤 시 노출되는 상단 info 고정 패널 ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 98,
        background: '#f3f3f3',
        padding: '10px 20px 14px',
        borderBottom: '1px solid #F2F4F6',
        opacity: scrolled ? 1 : 0,
        pointerEvents: scrolled ? 'auto' : 'none',
        transform: scrolled ? 'translateY(0)' : 'translateY(-6px)',
        transition: 'opacity 0.2s, transform 0.2s',
      }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 4, lineHeight: 1.3 }}>
          {cafe.name}
        </p>
        <p style={{ fontSize: 13, color: '#6B7684', marginBottom: hasHoursData ? 6 : 0, lineHeight: 1.4 }}>
          {cafe.address}
        </p>
        {hasHoursData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, color: statusColor,
              background: `${statusColor}18`, borderRadius: 4, padding: '2px 6px',
            }}>
              {statusLabel}
            </span>
            {todayHours && (
              <span style={{ fontSize: 12, color: '#8B95A1' }}>
                {todayHours.open} – {todayHours.close}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── 스크롤 콘텐츠 영역 ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ height: '100%', overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}
      >
        {/* 포토 히어로 */}
        {(() => {
          const heroImages = [
            { bg: 'linear-gradient(160deg, #6B7684 0%, #4E5968 40%, #252525 100%)' },
            { bg: 'linear-gradient(160deg, #7B6874 0%, #684E5E 40%, #251525 100%)' },
            { bg: 'linear-gradient(160deg, #6B8474 0%, #4E6858 40%, #152525 100%)' },
          ];
          return (
            <div style={{ height: 260, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
              {/* 수평 스크롤 */}
              <div
                ref={heroScrollRef}
                onScroll={() => {
                  if (!heroScrollRef.current) return;
                  setHeroIdx(Math.round(heroScrollRef.current.scrollLeft / heroScrollRef.current.offsetWidth));
                }}
                style={{
                  display: 'flex', width: '100%', height: '100%',
                  overflowX: 'auto', scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none' as React.CSSProperties['scrollbarWidth'],
                }}
              >
                {heroImages.map((img, i) => (
                  <div
                    key={i}
                    style={{
                      flexShrink: 0, width: '100%', height: '100%',
                      background: img.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      scrollSnapAlign: 'start',
                    }}
                  >
                    <span style={{ fontSize: 72, opacity: 0.5 }}>☕</span>
                  </div>
                ))}
              </div>
              {/* 상단 그라디언트 (헤더 아이콘 가독성 확보) */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 120,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)',
                pointerEvents: 'none',
              }} />
              {/* 원형 인디케이터 */}
              {heroImages.length > 1 && (
                <div style={{
                  position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: 6, pointerEvents: 'none',
                }}>
                  {heroImages.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: i === heroIdx ? 'white' : 'rgba(255,255,255,0.4)',
                        transition: 'background 0.2s',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── 기본 정보 섹션 ── */}
        <div ref={cafeInfoRef} style={{ padding: '20px 20px 0' }}>
          {/* 카페명 */}
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#191F28', marginBottom: 10 }}>
            {cafe.name}
          </h1>

          {/* 주소 + 길 안내 버튼 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 14, color: '#6B7684', flex: 1, lineHeight: 1.4 }}>
              {cafe.address}
            </p>
            <button
              onClick={() => openKakaoMapWeb(cafe)}
              style={{
                flexShrink: 0, height: 34, padding: '0 14px', marginLeft: 10,
                borderRadius: 8, border: 'none',
                fontSize: 13, fontWeight: 600, color: 'rgba(3,18,40,0.7)', background: '#E7E8EB',
              }}
            >
              길 안내
            </button>
          </div>

          {/* 영업 상태 + 영업시간 (데이터 없을 시 미노출) */}
          {hasHoursData && (
            <button
              onClick={() => setHoursExpanded(e => !e)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', textAlign: 'left', padding: '4px 0 16px',
              }}
            >
              {/* 상태 배지 */}
              <span style={{
                fontSize: 13, fontWeight: 700, color: statusColor,
                background: `${statusColor}18`, borderRadius: 6, padding: '3px 8px',
              }}>
                {statusLabel}
              </span>
              {/* 오늘 영업시간 */}
              {todayHours && (
                <span style={{ fontSize: 13, color: '#6B7684' }}>
                  {todayHours.open} - {todayHours.close}
                </span>
              )}
              {statusLabel === '휴무' && (
                <span style={{ fontSize: 13, color: '#8B95A1' }}>오늘은 휴무예요</span>
              )}
              <span style={{ marginLeft: 'auto' }}>
                <ChevronIcon expanded={hoursExpanded} />
              </span>
            </button>
          )}

          {/* 영업시간 전체 펼침 */}
          {hoursExpanded && (
            <div style={{
              background: '#F3F3F3', borderRadius: 12,
              padding: '12px 16px', marginBottom: 16,
            }}>
              {DAY_ORDER.map(day => {
                const h = cafe.hours[day];
                const isToday = day === todayKey;
                const isHoliday = cafe.regularHoliday.includes(day) || h === null || h === undefined;
                return (
                  <div key={day} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '5px 0',
                    fontSize: 14,
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? '#252525' : '#4E5968',
                  }}>
                    <span>{day}요일</span>
                    <span>{isHoliday ? '휴무' : `${(h as BusinessHour).open} - ${(h as BusinessHour).close}`}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Divider />

        {/* ── 카페 정보 섹션 ── */}
        <div style={{ padding: '20px 20px 4px' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#191F28', marginBottom: 16 }}>카페 정보</h2>

          {/* 좌석 | 콘센트 (가로 배치) */}
          <div style={{
            display: 'flex', border: '1px solid #F2F4F6',
            borderRadius: 12, overflow: 'hidden', marginBottom: 4,
          }}>
            <InfoBox label="좌석" value={cafe.seats ?? '?'} icon={<IcSeat />} />
            <div style={{ width: 1, background: '#F2F4F6' }} />
            <InfoBox label="콘센트" value={cafe.outlets ?? '?'} icon={<IcOutlet />} />
          </div>

          {/* 기타 정보 세로 나열 */}
          <InfoRow label="분위기" value={cafe.vibe} />
          <InfoRow label="가격대" value={cafe.priceRange} />
          <InfoRow label="연락처" value={cafe.phone} onCopy={handleCopyPhone} />
          <InfoRow label="사이트" value={cafe.snsUrl} isLink />
        </div>

        <Divider />

        {/* ── 편의시설 섹션 (데이터 없으면 미노출) ── */}
        {hasAmenities && (
          <>
            <div style={{ padding: '20px 16px' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#191F28', marginBottom: 14 }}>편의시설</h2>
              {/* 피그마: 343×128 fill=#f3f3f3, 20px inner pad, 4열 그리드, 서비스 아이템 50×50 */}
              <div style={{
                background: '#f3f3f3',
                borderRadius: 12,
                padding: '10px 20px',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 50px)',
                  gap: '18px 34px',
                  justifyContent: 'center',
                }}>
                  {activeAmenities.map(([key, { icon, label }]) => (
                    <AmenityBadge key={key} icon={icon} label={label} />
                  ))}
                </div>
              </div>
            </div>
            <Divider />
          </>
        )}

        {/* ── 리뷰 섹션 ── */}
        <div ref={reviewSectionRef} style={{ padding: '20px' }}>
          {/* 헤더: "리뷰 (n)" + 정렬 드롭다운 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, position: 'relative' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#191F28', flex: 1 }}>
              리뷰&nbsp;<span style={{ color: '#252525' }}>({reviews.length})</span>
            </h2>
            <button
              onClick={() => reviews.length > 0 && setReviewSortPopupOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', padding: 0,
                opacity: reviews.length === 0 ? 0.35 : 1,
                cursor: reviews.length === 0 ? 'default' : 'pointer',
                fontSize: 14, color: '#6B7684', fontWeight: 400,
              }}
            >
              {reviewSort}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {/* 정렬 팝업 */}
            {reviewSortPopupOpen && (
              <>
                <div onClick={() => setReviewSortPopupOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
                <div style={{
                  position: 'absolute', right: 0, top: 28, zIndex: 201,
                  background: '#FDFDFE', borderRadius: 12,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  width: 140, overflow: 'hidden',
                }}>
                  <div style={{ padding: '10px 16px 6px', fontSize: 13, fontWeight: 600, color: '#6B7684' }}>정렬</div>
                  {(['최신순', '추천순', '포토리뷰'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setReviewSort(opt); setReviewSortPopupOpen(false); setShowAllReviews(false); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '12px 16px', fontSize: 15,
                        fontWeight: opt === reviewSort ? 600 : 400,
                        color: opt === reviewSort ? '#252525' : '#191F28',
                        background: 'transparent',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {reviews.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* 카피 텍스트 */}
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#191F28', marginBottom: 4 }}>
                  아직 리뷰가 없어요!
                </p>
                <p style={{ fontSize: 13, color: '#8B95A1' }}>
                  {cafe.name}에 첫 번째로 리뷰를 남겨보세요
                </p>
              </div>
              {/* 리뷰 쓰기 버튼 */}
              <button
                onClick={() => setShowWriteReview(true)}
                style={{
                  width: '100%',
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: '#252525',
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 590,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                리뷰 쓰기
              </button>
            </div>
          ) : (
            <>
              {/* 포토 모아보기 (기본 6장, 초과 시 +N 더보기) */}
              {allReviewPhotos.length > 0 && (
                <PhotoMosaic
                  allPhotos={allReviewPhotos}
                  maxVisible={6}
                  onMore={() => setShowPhotoReview(true)}
                />
              )}

              {/* 리뷰 쓰기 유도 — 포토 모아보기 바로 하단 */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 12,
                marginBottom: 20,
              }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#191F28', marginBottom: 4 }}>
                    {cafe.name} 다녀오셨나요?
                  </p>
                  <p style={{ fontSize: 13, color: '#8B95A1' }}>
                    텍스트와 이미지로 경험을 남겨보세요!
                  </p>
                </div>
                <button
                  onClick={() => setShowWriteReview(true)}
                  style={{
                    width: '100%',
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: '#252525',
                    color: '#ffffff',
                    fontSize: 15,
                    fontWeight: 590,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  리뷰 쓰기
                </button>
              </div>

              {/* 리뷰 카드 목록 */}
              {(() => {
                const ordered = reviewSort === '포토리뷰'
                  ? sortedReviews.filter(r => r.images && r.images.length > 0)
                  : sortedReviews;
                const visible = showAllReviews ? ordered : ordered.slice(0, 3);
                return (
                  <>
                    {visible.map(review => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                    {!showAllReviews && ordered.length > 3 && (
                      <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button
                          onClick={() => setShowAllReviews(true)}
                          style={{
                            fontSize: 15, fontWeight: 400,
                            color: '#2272EB',
                            background: 'none', border: 'none', cursor: 'pointer',
                          }}
                        >
                          리뷰 더 보기
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>

        {/* 하단 여백 (플로팅 버튼 가려짐 방지) */}
        <div style={{ height: 88 }} />
      </div>

      {/* ── 복사 완료 토스트 ── */}
      <CopyToast visible={copyToastVisible} />
      <FavoriteSnackbar
        type={favoriteSnackbar}
        dissolving={snackbarDissolving}
      />

      {/* ── 하단 탭 네비바 (TDS 플로팅) ── */}
      <nav style={{
        position: 'absolute',
        left: 16, right: 16,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        background: '#ffffff',
        borderRadius: 28,
        boxShadow: '0 4px 24px rgba(0, 27, 55, 0.14)',
        zIndex: 100,
      }}>
        {DETAIL_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange ? onTabChange(tab.id) : onClose()}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: '8px 0',
                color: isActive ? '#252525' : '#b0b8c1',
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                transition: 'color 0.15s',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ── 저장 취소 확인 다이얼로그 ── */}
      {showUnfavoriteDialog && (
        <ConfirmDialog
          open={true}
          title={<ConfirmDialog.Title>저장을 취소할까요?</ConfirmDialog.Title>}
          description={<ConfirmDialog.Description>저장된 카페가 모음집에서 사라져요.</ConfirmDialog.Description>}
          cancelButton={
            <ConfirmDialog.CancelButton onClick={() => setShowUnfavoriteDialog(false)}>
              닫기
            </ConfirmDialog.CancelButton>
          }
          confirmButton={
            <ConfirmDialog.ConfirmButton color="danger" variant="weak" onClick={handleConfirmUnfavorite}>
              저장 취소
            </ConfirmDialog.ConfirmButton>
          }
          onClose={() => setShowUnfavoriteDialog(false)}
        />
      )}

      {/* ── 바텀시트들 ── */}

      {showLoginSheet && (
        <LoginPromptSheet onClose={() => setShowLoginSheet(false)} />
      )}
      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        shareTitle={cafe.name}
      />
    </div>
  );
}

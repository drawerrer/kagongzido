import { useState, useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { openURL, partner, tdsEvent, fetchAlbumPhotos, openCamera } from '@apps-in-toss/web-framework';
import { trackMapOpen, trackShareCafe } from '../services/analytics';
import { useBackEvent } from '../hooks/useBackEvent';
import { ConfirmDialog, Toast } from '@toss/tds-mobile';
import BottomSheet from '../components/BottomSheet';
import Snackbar from '../components/Snackbar';
import ShareSheet from '../components/ShareSheet';
import SectionHeader from '../components/SectionHeader';
import PhotoReviewPage, { ReviewPhoto } from './PhotoReviewPage';
import WriteReviewPage from './WriteReviewPage';
import { useFavorites } from '../context/FavoritesContext';
import { fetchReviews, fetchStoreByPlaceId, fetchUserLikedReviewIds, toggleReviewLike, deleteReview, updateReview, type ReviewRow } from '../services/db';
import SubButton from '../components/SubButton';
import CafePlaceholder from '../components/CafePlaceholder';
import IcPhoto from '../assets/icons/icon_photo.svg?react';
import IcCamera from '../assets/icons/icon_camera.svg?react';
import IcWarning from '../assets/icons/icon_warning.svg?react';
import IcX from '../assets/icons/icon_x.svg?react';
import IcOpen from '../assets/icons/icon_open.svg?react';
import IcCopy from '../assets/icons/icon_copy.svg?react';
import DiscardConfirmDialog from '../components/DiscardConfirmDialog';

// ── 편의시설 SVG 아이콘 ──────────────────────────────────────
function IcParking() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M19.9816 8.95217H4.01563C2.91063 8.95217 2.01562 9.84717 2.01562 10.9522V20.4992C2.01562 21.0512 2.46363 21.4992 3.01562 21.4992H5.45963C6.01163 21.4992 6.45963 21.0512 6.45963 20.4992V19.1352H17.5376V20.4992C17.5376 21.0512 17.9856 21.4992 18.5376 21.4992H20.9816C21.5336 21.4992 21.9816 21.0512 21.9816 20.4992V10.9512C21.9816 9.84617 21.0876 8.95217 19.9816 8.95217ZM18.0176 13.7152H5.97962C5.59063 13.7152 5.20263 13.3262 5.20263 12.9382C5.20263 12.5502 5.49362 12.1612 5.97962 12.1612H18.1146C18.5036 12.1612 18.8916 12.5502 18.8916 12.9382C18.8916 13.3282 18.5036 13.7152 18.0176 13.7152Z" fill="currentColor"/>
      <path d="M18.3083 4.52434C18.0173 3.45634 17.0463 2.77734 15.8813 2.77734H8.11425C7.04625 2.77734 6.07625 3.45634 5.68725 4.52434L4.78125 7.45334H19.2132L18.3072 4.52434H18.3083Z" fill="currentColor"/>
    </svg>
  );
}
function IcPets() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_pets)">
        <path d="M18.8552 14.1678L18.6752 13.7358C17.6122 10.9538 14.9772 9.08779 12.0002 9.00879C8.96722 9.09379 6.29622 11.0268 5.26722 13.8808L5.11022 14.2748C3.51522 18.2728 6.14522 21.1238 10.0752 21.1238H13.9332C17.9092 21.1238 20.5382 18.1758 18.8552 14.1678Z" fill="currentColor"/>
        <path d="M20.2254 11.72C21.463 11.72 22.4664 10.6446 22.4664 9.31802C22.4664 7.99143 21.463 6.91602 20.2254 6.91602C18.9877 6.91602 17.9844 7.99143 17.9844 9.31802C17.9844 10.6446 18.9877 11.72 20.2254 11.72Z" fill="currentColor"/>
        <path d="M3.77225 11.72C5.00992 11.72 6.01325 10.6446 6.01325 9.31802C6.01325 7.99143 5.00992 6.91602 3.77225 6.91602C2.53458 6.91602 1.53125 7.99143 1.53125 9.31802C1.53125 10.6446 2.53458 11.72 3.77225 11.72Z" fill="currentColor"/>
        <path d="M8.81378 8.05198C10.1326 8.05198 11.2018 6.89329 11.2018 5.46398C11.2018 4.03466 10.1326 2.87598 8.81378 2.87598C7.49492 2.87598 6.42578 4.03466 6.42578 5.46398C6.42578 6.89329 7.49492 8.05198 8.81378 8.05198Z" fill="currentColor"/>
        <path d="M15.1849 8.05198C16.5037 8.05198 17.5729 6.89329 17.5729 5.46398C17.5729 4.03466 16.5037 2.87598 15.1849 2.87598C13.866 2.87598 12.7969 4.03466 12.7969 5.46398C12.7969 6.89329 13.866 8.05198 15.1849 8.05198Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip_pets"><rect width="24" height="24" fill="white"/></clipPath>
      </defs>
    </svg>
  );
}
function IcTimerOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_timeroff)">
        <path d="M18.7787 18.211C18.7787 16.4248 17.7588 14.7958 16.152 14.0158L13.2168 12.5908C12.8904 12.4324 12.7542 12.0394 12.9126 11.713C12.9768 11.5804 13.0842 11.4736 13.2168 11.4088L16.1525 9.9838C17.7593 9.2038 18.7787 7.5742 18.7787 5.7886V2.5498H5.21875V5.7886C5.21875 7.5748 6.23875 9.2038 7.84555 9.9838L10.7814 11.4088C11.1078 11.5672 11.244 11.9602 11.0856 12.2866C11.0214 12.4192 10.914 12.526 10.7814 12.5908L7.84495 14.0158C6.23815 14.7958 5.21875 16.4254 5.21875 18.211V21.4498H18.7787V18.211Z" fill="currentColor"/>
        <path d="M18.78 21.4502H5.21875C4.80475 21.4502 4.46875 21.7862 4.46875 22.2002C4.46875 22.6142 4.80475 22.9502 5.21875 22.9502H18.78C19.1939 22.9502 19.5299 22.6142 19.5299 22.2002C19.5299 21.7862 19.1939 21.4502 18.78 21.4502Z" fill="currentColor"/>
        <path d="M18.78 2.5498C19.1939 2.5498 19.5299 2.2138 19.5299 1.7998C19.5299 1.3858 19.1939 1.0498 18.78 1.0498H5.21875C4.80475 1.0498 4.46875 1.3858 4.46875 1.7998C4.46875 2.2138 4.80475 2.5498 5.21875 2.5498H18.78Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip_timeroff"><rect width="24" height="24" fill="white"/></clipPath>
      </defs>
    </svg>
  );
}
function IcPublicToilet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_wc)">
        <path d="M17.1016 2.09961H6.90156C4.2506 2.09961 2.10156 4.24864 2.10156 6.89961V17.0996C2.10156 19.7506 4.2506 21.8996 6.90156 21.8996H17.1016C19.7525 21.8996 21.9016 19.7506 21.9016 17.0996V6.89961C21.9016 4.24864 19.7525 2.09961 17.1016 2.09961Z" fill="currentColor"/>
        <path d="M10.1164 16.5447L11.824 11.7063C11.8802 11.5468 11.8974 11.3762 11.874 11.2087C11.8507 11.0412 11.7875 10.8817 11.6899 10.7437C11.5922 10.6057 11.4629 10.4931 11.3127 10.4153C11.1625 10.3376 10.9959 10.2969 10.8268 10.2969H7.41281C7.24371 10.2969 7.0771 10.3376 6.92693 10.4153C6.77676 10.4931 6.64742 10.6057 6.54975 10.7437C6.45208 10.8817 6.38893 11.0412 6.36559 11.2087C6.34225 11.3762 6.35941 11.5468 6.41561 11.7063L8.12261 16.5447C8.19542 16.7509 8.33039 16.9295 8.50894 17.0558C8.68748 17.1821 8.90081 17.2499 9.11951 17.2499C9.33822 17.2499 9.55154 17.1821 9.73009 17.0558C9.90863 16.9295 10.0436 16.7509 10.1164 16.5447Z" fill="#F9FAFB"/>
        <path d="M13.885 10.8088L12.1774 15.6478C12.1211 15.8072 12.104 15.9778 12.1273 16.1453C12.1506 16.3127 12.2138 16.4722 12.3115 16.6102C12.4092 16.7482 12.5385 16.8607 12.6887 16.9384C12.8389 17.0161 13.0055 17.0566 13.1746 17.0566H16.5886C16.7576 17.0566 16.9243 17.0161 17.0744 16.9384C17.2246 16.8607 17.354 16.7482 17.4517 16.6102C17.5493 16.4722 17.6125 16.3127 17.6358 16.1453C17.6592 15.9778 17.642 15.8072 17.5858 15.6478L15.8788 10.8088C15.806 10.6025 15.671 10.424 15.4924 10.2977C15.3139 10.1713 15.1006 10.1035 14.8819 10.1035C14.6632 10.1035 14.4498 10.1713 14.2713 10.2977C14.0928 10.424 13.9578 10.6025 13.885 10.8088Z" fill="#F9FAFB"/>
        <path d="M9.11812 9.33098C9.83057 9.33098 10.4081 8.75342 10.4081 8.04098C10.4081 7.32853 9.83057 6.75098 9.11812 6.75098C8.40568 6.75098 7.82812 7.32853 7.82812 8.04098C7.82812 8.75342 8.40568 9.33098 9.11812 9.33098Z" fill="#F9FAFB"/>
        <path d="M14.8798 9.33098C15.5923 9.33098 16.1698 8.75342 16.1698 8.04098C16.1698 7.32853 15.5923 6.75098 14.8798 6.75098C14.1674 6.75098 13.5898 7.32853 13.5898 8.04098C13.5898 8.75342 14.1674 9.33098 14.8798 9.33098Z" fill="#F9FAFB"/>
      </g>
      <defs>
        <clipPath id="clip_wc"><rect width="24" height="24" fill="white"/></clipPath>
      </defs>
    </svg>
  );
}
function IcToilet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M21.9994 21.4283V10.2633C21.9994 6.01529 20.2774 2.57129 18.1534 2.57129H8.44141C9.93141 4.08229 10.8924 6.89329 10.8924 10.2633V21.4283H21.9994Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M5.846 12.3153C5.28 12.3153 4.821 11.3973 4.821 10.2643C4.821 9.13029 5.28 8.21229 5.846 8.21229C6.412 8.21229 6.872 9.13029 6.872 10.2643C6.872 11.3973 6.412 12.3153 5.846 12.3153ZM5.846 2.57129C3.722 2.57129 2 6.01529 2 10.2643C2 14.5123 3.722 17.9563 5.846 17.9563C7.971 17.9563 9.693 14.5123 9.693 10.2643C9.693 6.01529 7.971 2.57129 5.846 2.57129Z" fill="currentColor"/>
    </svg>
  );
}
function IcPeople() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_people)">
        <path fillRule="evenodd" clipRule="evenodd" d="M7.5 11.6475C7.99246 11.6475 8.48009 11.5505 8.93506 11.362C9.39003 11.1736 9.80343 10.8973 10.1517 10.5491C10.4999 10.2009 10.7761 9.78749 10.9645 9.33252C11.153 8.87755 11.25 8.38992 11.25 7.89746C11.25 7.405 11.153 6.91737 10.9645 6.4624C10.7761 6.00743 10.4999 5.59403 10.1517 5.24581C9.80343 4.89759 9.39003 4.62137 8.93506 4.43291C8.48009 4.24446 7.99246 4.14746 7.5 4.14746C6.50544 4.14746 5.55161 4.54255 4.84835 5.24581C4.14509 5.94907 3.75 6.9029 3.75 7.89746C3.75 8.89202 4.14509 9.84585 4.84835 10.5491C5.55161 11.2524 6.50544 11.6475 7.5 11.6475ZM8 17.8285C8 16.5645 8.771 14.6935 10.48 13.2765C9.637 12.9795 8.652 12.7935 7.5 12.7935C2.46 12.7935 0.5 16.2315 0.5 17.8285C0.5 19.4285 4.673 19.8525 7.5 19.8525C7.971 19.8525 8.48 19.8395 9.001 19.8125C8.34 19.2855 8 18.6255 8 17.8285Z" fill="currentColor"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M16.5 12.7945C11.46 12.7945 9.5 16.2315 9.5 17.8295C9.5 19.4275 13.673 19.8535 16.5 19.8535C19.327 19.8535 23.5 19.4275 23.5 17.8295C23.5 16.2315 21.54 12.7945 16.5 12.7945ZM16.5 11.6475C16.9925 11.6475 17.4801 11.5505 17.9351 11.362C18.39 11.1736 18.8034 10.8973 19.1517 10.5491C19.4999 10.2009 19.7761 9.78749 19.9645 9.33252C20.153 8.87755 20.25 8.38992 20.25 7.89746C20.25 7.405 20.153 6.91737 19.9645 6.4624C19.7761 6.00743 19.4999 5.59403 19.1517 5.24581C18.8034 4.89759 18.39 4.62137 17.9351 4.43291C17.4801 4.24446 16.9925 4.14746 16.5 4.14746C15.5054 4.14746 14.5516 4.54255 13.8483 5.24581C13.1451 5.94907 12.75 6.9029 12.75 7.89746C12.75 8.89202 13.1451 9.84585 13.8483 10.5491C14.5516 11.2524 15.5054 11.6475 16.5 11.6475Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip_people"><rect width="24" height="24" fill="white"/></clipPath>
      </defs>
    </svg>
  );
}
function IcCoffee() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.62531 22.087C5.64707 22.3362 5.76142 22.5681 5.9458 22.7372C6.13017 22.9062 6.37119 22.9999 6.62131 23H17.5843C17.8344 22.9999 18.0755 22.9062 18.2598 22.7372C18.4442 22.5681 18.5586 22.3362 18.5803 22.087L18.8323 19.193L19.5493 10.969L19.6653 9.631H4.54031L5.62531 22.087ZM20.8023 4.53H19.2053L18.1163 1.666C18.0417 1.47019 17.9094 1.30165 17.7369 1.18271C17.5644 1.06378 17.3598 1.00006 17.1503 1H7.05631C6.62631 1 6.24231 1.265 6.08931 1.666L5.00031 4.53H3.19531C3.0627 4.53 2.93553 4.58268 2.84176 4.67645C2.74799 4.77021 2.69531 4.89739 2.69531 5.03V7.131C2.69531 7.26361 2.74799 7.39079 2.84176 7.48455C2.93553 7.57832 3.0627 7.631 3.19531 7.631H20.8023C20.9349 7.631 21.0621 7.57832 21.1559 7.48455C21.2496 7.39079 21.3023 7.26361 21.3023 7.131V5.03C21.3023 4.89739 21.2496 4.77021 21.1559 4.67645C21.0621 4.58268 20.9349 4.53 20.8023 4.53Z" fill="currentColor"/>
    </svg>
  );
}
function IcWifi() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.5018 18.8602C10.5016 18.4611 10.6597 18.0793 10.9411 17.7977C11.2225 17.5161 11.6042 17.3579 12.0023 17.3577C12.4004 17.3576 12.7822 17.5156 13.0638 17.797C13.3454 18.0784 13.5036 18.4601 13.5038 18.8582C13.5039 19.0553 13.4652 19.2505 13.3899 19.4327C13.3146 19.6149 13.2041 19.7804 13.0649 19.9199C12.9256 20.0594 12.7602 20.17 12.5781 20.2456C12.3961 20.3211 12.2009 20.3601 12.0038 20.3602C11.8067 20.3604 11.6115 20.3217 11.4293 20.2463C11.2471 20.171 11.0816 20.0606 10.9421 19.9213C10.8026 19.782 10.692 19.6166 10.6164 19.4346C10.5409 19.2525 10.5019 19.0573 10.5018 18.8602ZM22.1138 9.99822C22.3636 9.99817 22.6066 9.92329 22.8134 9.78324C23.0202 9.64318 23.1804 9.44438 23.2731 9.21246C23.3659 8.98055 23.3871 8.72616 23.3339 8.4821C23.2807 8.23805 23.1556 8.01552 22.9748 7.84322C20.0058 5.01022 16.1078 3.45022 12.0018 3.45022C7.91377 3.44263 3.98132 5.01683 1.02778 7.84322C0.787893 8.0721 0.648753 8.38691 0.64097 8.71838C0.633187 9.04985 0.757399 9.37083 0.986281 9.61072C1.21516 9.85061 1.52997 9.98975 1.86144 9.99753C2.19291 10.0053 2.51389 9.8811 2.75378 9.65222C5.2429 7.27055 8.55678 5.94399 12.0018 5.95022C15.4471 5.94373 18.7614 7.27031 21.2508 9.65222C21.4928 9.88322 21.8028 9.99822 22.1138 9.99822Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M18.7461 13.366C18.9972 13.366 19.2415 13.2903 19.4491 13.149C19.6567 13.0076 19.8169 12.807 19.909 12.5734C20.001 12.3397 20.0205 12.0837 19.9651 11.8388C19.9096 11.5938 19.7818 11.3712 19.5981 11.2C17.5291 9.27297 14.8311 8.20997 12.0021 8.20997C9.18228 8.2061 6.46662 9.27506 4.40606 11.2C4.16339 11.4259 4.02042 11.739 4.00861 12.0704C3.99679 12.4018 4.1171 12.7243 4.34307 12.967C4.56903 13.2096 4.88214 13.3526 5.21352 13.3644C5.54489 13.3762 5.86739 13.2559 6.11006 13.03C7.70844 11.5369 9.8148 10.7075 12.0021 10.71C14.1894 10.7072 16.2959 11.5366 17.8941 13.03C18.1351 13.255 18.4411 13.366 18.7461 13.366Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M15.4377 16.6753C15.6919 16.6753 15.9401 16.5968 16.1491 16.4521C16.3582 16.3074 16.5181 16.1024 16.6077 15.8645C16.6972 15.6265 16.712 15.3669 16.6502 15.1203C16.5884 14.8737 16.4529 14.6519 16.2617 14.4843C15.0833 13.4525 13.5704 12.8838 12.0042 12.8838C10.438 12.8838 8.92504 13.4525 7.74668 14.4843C7.61938 14.5912 7.5147 14.7225 7.43877 14.8704C7.36283 15.0183 7.31716 15.1799 7.30444 15.3457C7.29172 15.5115 7.31221 15.6781 7.36469 15.8359C7.41717 15.9936 7.5006 16.1394 7.61009 16.2645C7.71958 16.3896 7.85294 16.4916 8.00234 16.5646C8.15175 16.6375 8.31421 16.6799 8.48021 16.6893C8.64621 16.6987 8.81242 16.6749 8.9691 16.6192C9.12578 16.5636 9.26978 16.4773 9.39268 16.3653C10.8377 15.1013 13.1697 15.1013 14.6157 16.3653C14.8527 16.5733 15.1457 16.6753 15.4377 16.6753Z" fill="currentColor"/>
    </svg>
  );
}
function IcTakeout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_takeout)">
        <path d="M17.9281 13.2854C18.8281 13.4854 19.7281 13.4854 20.6281 13.5854C21.5281 13.5854 22.2281 13.1854 22.5281 12.3854L23.1281 10.8854C23.9281 8.68539 23.6281 5.28539 22.0281 3.28539C20.9281 1.98539 18.9281 1.58539 17.4281 2.48539C15.2281 3.78539 13.8281 6.88539 13.8281 9.18539L13.9281 10.7854C13.9281 11.5854 14.5281 12.2854 15.3281 12.4854C16.2281 12.8854 17.0281 13.0854 17.9281 13.2854Z" fill="currentColor"/>
        <path d="M20.3289 14.6859C19.4289 14.6859 18.5289 14.5859 17.7289 14.3859C16.8289 14.1859 16.0289 13.9859 15.1289 13.7859C14.4289 13.5859 13.6289 13.9859 13.6289 14.6859V15.9859C13.6289 17.4859 14.6289 18.9859 16.3289 19.4859C16.5289 19.4859 16.6289 19.5859 16.8289 19.5859C17.0289 19.5859 17.1289 19.6859 17.3289 19.6859C19.0289 19.7859 20.5289 18.7859 21.0289 17.2859L21.5289 15.9859C21.6289 15.4859 21.1289 14.7859 20.3289 14.6859Z" fill="currentColor"/>
        <path d="M6.12719 15.4856C5.22719 15.6856 4.32719 15.6856 3.42719 15.7856C2.52719 15.7856 1.82719 15.3856 1.52719 14.5856L0.927194 13.0856C0.127194 10.8856 0.427194 7.48558 2.02719 5.48558C3.12719 4.18558 5.12719 3.78558 6.62719 4.68558C8.82719 5.98558 10.2272 9.08558 10.2272 11.3856L10.1272 12.9856C10.1272 13.7856 9.52719 14.4856 8.72719 14.6856C7.82719 15.0856 7.02719 15.2856 6.12719 15.4856Z" fill="currentColor"/>
        <path d="M3.7283 16.8861C4.6283 16.8861 5.5283 16.7861 6.3283 16.5861C7.2283 16.3861 8.0283 16.1861 8.9283 15.9861C9.6283 15.7861 10.4283 16.1861 10.4283 16.8861V18.1861C10.4283 19.6861 9.4283 21.1861 7.7283 21.6861C7.5283 21.6861 7.4283 21.7861 7.2283 21.7861C7.0283 21.7861 6.9283 21.8861 6.7283 21.8861C5.0283 21.9861 3.5283 20.9861 3.0283 19.4861L2.5283 18.1861C2.4283 17.6861 2.9283 16.9861 3.7283 16.8861Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip_takeout"><rect width="24" height="24" fill="white"/></clipPath>
      </defs>
    </svg>
  );
}
function IcWheelchair() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14.811 17.4999C14.145 20.0879 11.796 21.9999 9 21.9999C5.6865 21.9999 3 19.3134 3 15.9999C3 13.5784 4.4345 11.4919 6.5 10.5439" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 6L10 15L17.5 14.5L19 20H20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 4C11 4.53043 10.7893 5.03914 10.4142 5.41421C10.0391 5.78929 9.53043 6 9 6C8.46957 6 7.96086 5.78929 7.58579 5.41421C7.21071 5.03914 7 4.53043 7 4C7 3.46957 7.21071 2.96086 7.58579 2.58579C7.96086 2.21071 8.46957 2 9 2C9.53043 2 10.0391 2.21071 10.4142 2.58579C10.7893 2.96086 11 3.46957 11 4Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.5 10H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
  photo_urls?: string[];  // 리뷰 사진 URL 배열
  isReporter?: boolean;   // 카페 제보자 여부 → 항상 최상단
  likeCount?: number;     // 좋아요 수
  isMyReview?: boolean;   // 본인이 작성한 리뷰 여부
  outlet_status?: string; // 콘센트 평가
  seat_status?: string;   // 좌석 평가
  noise_status?: string;  // 소음 평가
}

interface CafeDetailData {
  id: string;
  name: string;
  address: string;
  location?: { lat: number; lng: number };
  distance?: number;
  thumbnailUrl?: string;
  photos?: string[];
  hours: Partial<Record<DayKey, BusinessHour | null>>;
  hoursText?: string;   // DB에 텍스트로 저장된 원본 (표시용)
  regularHoliday: DayKey[];
  seats?: string;
  outlets?: string;
  vibe?: string;
  priceRange?: string;
  phone?: string;
  snsUrl?: string;
  /** 폐업/휴업 시점 — 채워져 있으면 상단에 안내 배너 표시 */
  closedAt?: string | null;
  amenities: Partial<Record<
    'parking' | 'pets' | 'noTimeLimit' | 'separateRestroom' | 'indoorRestroom' | 'groupVisit' | 'decafFree' | 'wifi' | 'takeout' | 'wheelchair',
    boolean
  >>;
  reviews: ReviewItem[];
}

// ────────── 상수 ────────────────────────────────────────────
const DAY_ORDER: DayKey[] = ['월', '화', '수', '목', '금', '토', '일'];
const JS_TO_KR: DayKey[] = ['일', '월', '화', '수', '목', '금', '토'];
const WEEKDAYS: DayKey[] = ['월', '화', '수', '목', '금'];
const WEEKEND:  DayKey[] = ['토', '일'];

// ────────── 영업시간 정규화 ─────────────────────────────────
// 요일 매핑 테이블
const DAY_PATTERNS: [RegExp, DayKey][] = [
  [/월요일|월(?=요|,|$|\s)/, '월'],
  [/화요일|화(?=요|,|$|\s)/, '화'],
  [/수요일|수(?=요|,|$|\s)/, '수'],
  [/목요일|목(?=요|,|$|\s)/, '목'],
  [/금요일|금(?=요|,|$|\s)/, '금'],
  [/토요일|토(?=요|,|$|\s)/, '토'],
  [/일요일|일(?=요|,|$|\s)/, '일'],
];

// JSONB 값 → hours 구조 변환 (문자열 / 객체 모두 처리)
function parseHourEntry(val: unknown): BusinessHour | null {
  if (!val) return null;
  if (typeof val === 'object' && !Array.isArray(val)) {
    const v = val as Record<string, unknown>;
    if (typeof v.open === 'string' && typeof v.close === 'string') {
      return { open: v.open.trim(), close: v.close.trim() };
    }
  }
  if (typeof val === 'string') {
    const m = val.match(/(\d{1,2}:\d{2})\s*[~\-]\s*(다음날\s*)?(\d{1,2}:\d{2})/);
    if (m) return { open: m[1], close: (m[2] ? '다음날 ' : '') + m[3] };
  }
  return null;
}

// 텍스트에서 언급된 요일 추출
function extractDays(line: string): DayKey[] {
  return DAY_PATTERNS.filter(([pat]) => pat.test(line)).map(([, day]) => day);
}

// 텍스트 파싱 → { hours, regularHoliday }
function parseHoursText(text: string): {
  hours: Partial<Record<DayKey, BusinessHour | null>>;
  regularHoliday: DayKey[];
} {
  const hours: Partial<Record<DayKey, BusinessHour | null>> = {};
  const regularHoliday: DayKey[] = [];

  // "24 시간" / "연중무휴" → 항상 영업
  if (/24\s*시간|연중무휴/i.test(text)) {
    DAY_ORDER.forEach(d => { hours[d] = { open: '00:00', close: '24:00' }; });
    return { hours, regularHoliday };
  }

  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t) continue;

    // ── 정기휴무 라인 ──
    if (/정기\s*휴무|정기\s*휴일|매주\s*(.*)\s*휴무|휴무일/.test(t)) {
      const days = extractDays(t);
      // 주중/주말 표기도 처리
      if (days.length === 0) {
        if (/주중/.test(t)) WEEKDAYS.forEach(d => regularHoliday.push(d));
        if (/주말/.test(t)) WEEKEND.forEach(d  => regularHoliday.push(d));
      } else {
        days.forEach(d => regularHoliday.push(d));
      }
      continue;
    }

    // ── 영업시간 라인 ──
    const m = t.match(/(\d{1,2}:\d{2})\s*[~\-]\s*(다음날\s*)?(\d{1,2}:\d{2})/);
    if (!m) continue;

    const h: BusinessHour = {
      open:  m[1].trim(),
      close: (m[2] ? '다음날 ' : '') + m[3].trim(),
    };

    if      (/매일/.test(t)) DAY_ORDER.forEach(d => { hours[d] = h; });
    else if (/주중/.test(t)) WEEKDAYS.forEach(d  => { hours[d] = h; });
    else if (/주말/.test(t)) WEEKEND.forEach(d   => { hours[d] = h; });
    else {
      const days = extractDays(t);
      if (days.length > 0) days.forEach(d => { hours[d] = h; });
    }
  }

  return { hours, regularHoliday };
}

function expandHours(
  raw: string | Record<string, unknown> | null
): { hours: Partial<Record<DayKey, BusinessHour | null>>; regularHoliday: DayKey[] } {
  if (!raw) return { hours: {}, regularHoliday: [] };

  // ── 문자열 스칼라 (현재 DB 저장 방식) ──
  if (typeof raw === 'string') return parseHoursText(raw);

  // ── 객체 형식 (구조화 포맷) ──
  const result: Partial<Record<DayKey, BusinessHour | null>> = {};
  const set = (days: DayKey[], key: string) => {
    const h = parseHourEntry(raw[key]);
    days.forEach(d => { result[d] = h; });
  };
  if (raw['매일'] !== undefined) set(DAY_ORDER, '매일');
  if (raw['주중'] !== undefined) set(WEEKDAYS,  '주중');
  if (raw['주말'] !== undefined) set(WEEKEND,   '주말');
  DAY_ORDER.forEach(d => { if (raw[d] !== undefined) result[d] = parseHourEntry(raw[d]); });

  return { hours: result, regularHoliday: [] };
}


// ────────── 편의시설 한글 → 키 매핑 ────────────────────────────
function parseAmenityKey(raw: string): string | null {
  const s = raw.replace(/\s/g, '');
  if (/주차/.test(s))                         return 'parking';
  if (/시간제한없|무제한/.test(s))             return 'noTimeLimit';
  if (/남.?녀화장실구분|남.?여화장실구분|화장실구분/.test(s)) return 'separateRestroom';
  if (/내부화장실/.test(s))                   return 'indoorRestroom';
  if (/단체방문/.test(s))                     return 'groupVisit';
  if (/반려동물/.test(s))                     return 'pets';
  if (/디카페인/.test(s))                     return 'decafFree';
  if (/무선인터넷|와이파이|wifi/i.test(s))     return 'wifi';
  if (/포장/.test(s))                         return 'takeout';
  if (/휠체어/.test(s))                       return 'wheelchair';
  return null;
}

const AMENITY_CONFIG: Record<string, { icon: ReactNode; label: string }> = {
  parking:          { icon: <IcParking />,      label: '주차' },
  pets:             { icon: <IcPets />,          label: '반려동물 동반' },
  noTimeLimit:      { icon: <IcTimerOff />,      label: '시간 제한 없음' },
  separateRestroom: { icon: <IcPublicToilet />,  label: '남/녀 화장실 구분' },
  indoorRestroom:   { icon: <IcToilet />,        label: '내부화장실' },
  groupVisit:       { icon: <IcPeople />,        label: '단체 방문 가능' },
  decafFree:        { icon: <IcCoffee />,        label: '디카페인 무료' },
  wifi:             { icon: <IcWifi />,          label: '무선 인터넷' },
  takeout:          { icon: <IcTakeout />,       label: '포장 가능' },
  wheelchair:       { icon: <IcWheelchair />,    label: '휠체어 이용' },
};

// ────────── 빈 상태 fallback ────────────────────────────────
const EMPTY_CAFE: CafeDetailData = {
  id: '',
  name: '',
  address: '',
  hours: {},
  hoursText: undefined,
  regularHoliday: [],
  amenities: {},
  reviews: [],
};

// ────────── 유틸 함수 ────────────────────────────────────────
function getTodayKey(): DayKey {
  return JS_TO_KR[new Date().getDay()];
}

// "다음날 03:30" → 1440 + 210 = 1650분, 일반 "21:00" → 1260분
function parseTimeMinutes(timeStr: string): number {
  const isNextDay = timeStr.startsWith('다음날');
  const t = timeStr.replace('다음날', '').trim();
  const [h, m] = t.split(':').map(Number);
  return (isNextDay ? 24 * 60 : 0) + (h || 0) * 60 + (m || 0);
}

function getStatusInfo(cafe: CafeDetailData): { label: string; color: string } {
  const today = getTodayKey();
  const h = cafe.hours[today];
  if (cafe.regularHoliday.includes(today) || h === null || h === undefined) {
    return { label: '휴무', color: '#8B95A1' };
  }
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const open  = parseTimeMinutes(h.open);
  const close = parseTimeMinutes(h.close);
  if (cur < open - 30) return { label: '영업 종료', color: '#8B95A1' };
  if (cur < open)      return { label: '준비 중',   color: '#F59E0B' };
  if (cur >= close)    return { label: '영업 종료', color: '#8B95A1' };
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

// CopyIcon · LinkIcon 인라인 SVG 제거 — icon_copy.svg / icon_open.svg 로 통일
// 둘 다 동일 stroke-width(2.2) 로 만들어서 같은 16×16 에서 두께가 일치하도록 조정

// ────────── (NavBar icon helpers removed) ─────────────────────

// ────────── 서브 컴포넌트 ────────────────────────────────────
function Divider() {
  return <div style={{ height: 8, background: '#F2F4F6' }} />;
}

function InfoBox({ label, value, icon, tooltip }: { label: string; value: string; icon?: ReactNode; tooltip?: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div style={{ flex: 1, padding: '14px 16px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4, color: '#8B95A1' }}>
        {icon}
        <p style={{ fontSize: 12, color: '#8B95A1' }}>{label}</p>
        {tooltip && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowTooltip(v => !v); }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', lineHeight: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.9977 6.60059C11.2247 6.60059 10.5977 7.22759 10.5977 8.00059C10.5977 8.77359 11.2247 9.40059 11.9977 9.40059C12.7707 9.40059 13.3977 8.77359 13.3977 8.00059C13.3977 7.22759 12.7707 6.60059 11.9977 6.60059Z" fill="#8B95A1"/>
              <path d="M12 17.635C11.448 17.635 11 17.188 11 16.635V12C11 11.448 11.448 11 12 11C12.552 11 13 11.448 13 12V16.635C13 17.188 12.552 17.635 12 17.635Z" fill="#8B95A1"/>
              <path d="M11.9984 23.1004C5.87744 23.1004 0.898438 18.1204 0.898438 12.0004C0.898438 5.87939 5.87744 0.900391 11.9984 0.900391C18.1184 0.900391 23.0984 5.87939 23.0984 12.0004C23.0984 18.1204 18.1184 23.1004 11.9984 23.1004ZM11.9984 3.10039C7.09044 3.10039 3.09844 7.09239 3.09844 12.0004C3.09844 16.9074 7.09044 20.9004 11.9984 20.9004C16.9054 20.9004 20.8984 16.9074 20.8984 12.0004C20.8984 7.09239 16.9054 3.10039 11.9984 3.10039Z" fill="#8B95A1"/>
            </svg>
          </button>
        )}
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#191F28' }}>{value}</p>
      {tooltip && showTooltip && (
        <>
          <div
            onClick={() => setShowTooltip(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          />
          <div
            onClick={() => setShowTooltip(false)}
            style={{
              position: 'absolute', bottom: 'calc(100% + 6px)', left: 12,
              background: '#333D4B', color: '#fff',
              borderRadius: 8, padding: '8px 12px',
              fontSize: 12, lineHeight: '18px', whiteSpace: 'pre-line',
              zIndex: 100, minWidth: 160, maxWidth: 220,
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}
          >
            {tooltip}
            <div style={{
              position: 'absolute', top: '100%', left: 16,
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #333D4B',
            }} />
          </div>
        </>
      )}
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
  const displayValue = value ?? '-';

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
          <button onClick={() => openURL(value)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
            {/* 연락처의 CopyIcon 과 동일 스펙: 16×16 / #6B7684 */}
            <IcOpen width={16} height={16} style={{ color: '#6B7684', display: 'block' }} />
          </button>
        )}
        {onCopy && value && (
          <button onClick={onCopy} style={{ flexShrink: 0, padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
            {/* IcOpen 과 동일 스펙: 16×16 / #6B7684 / stroke-width 2.2 */}
            <IcCopy width={16} height={16} style={{ color: '#6B7684', display: 'block' }} />
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
      color: '#333D4B',
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
      background: '#F2F4F6', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      {bg ? (
        <img src={bg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <CafePlaceholder size="45%" />
      )}
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
  onPhotoClick,
}: {
  allPhotos: string[];
  maxVisible?: number;
  onMore?: () => void;
  onPhotoClick?: (index: number) => void;
}) {
  if (allPhotos.length === 0) return null;

  const visible = allPhotos.slice(0, maxVisible);
  const remaining = allPhotos.length - maxVisible;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* 썸네일 그리드 — 항상 3열 유지 (셀 크기 일관성)
          단, 사진 1·2장일 때 빈 셀이 우측에 생기지 않게 컬럼 수만 채워질 만큼 노출
          모서리 둥글기는 각 셀에 직접 적용 (4px — StoreCard 썸네일과 동일) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 3,
      }}>
        {visible.map((bg, i) => {
          const isLastSlot = i === maxVisible - 1 && remaining > 0;
          return (
            <div
              key={i}
              onClick={() => isLastSlot ? onMore?.() : onPhotoClick?.(i)}
              style={{
                aspectRatio: '1 / 1',
                background: '#F2F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
                borderRadius: 4,
              }}
            >
              {bg ? (
                <img src={bg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <CafePlaceholder size="45%" />
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

// ── 신고/차단 사유 ────────────────────────────────────────────
const REPORT_REASONS = ['스팸/광고', '욕설/혐오 표현', '부적절한 사진', '기타'];
const BLOCK_REASONS = ['불쾌한 내용을 게시해요', '스팸 또는 광고성 글을 올려요', '욕설 또는 혐오 표현을 사용해요', '허위 정보를 올려요', '기타'];

// ── 리뷰 카드 (강화) ─────────────────────────────────────────
function ReviewCard({ review, initialLiked, onToggleLike, onEditReview, onDeleteReview }: {
  review: ReviewItem;
  initialLiked: boolean;
  onToggleLike: (reviewId: string) => Promise<boolean>;
  onEditReview?: () => void;
  onDeleteReview?: () => void;
}) {
  const [textExpanded, setTextExpanded] = useState(false);
  const [expandedImgIdx, setExpandedImgIdx] = useState<number | null>(null);
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(review.likeCount ?? 0);

  // 부모에서 prefetch 완료 시 초기 상태 동기화
  useEffect(() => { setLiked(initialLiked); }, [initialLiked]);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [blockDone, setBlockDone] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const CONTENT_THRESHOLD = 50; // 띄어쓰기 포함 50자
  const isLong = review.content.length > CONTENT_THRESHOLD;

  const handleReport = () => {
    setShowReport(false);
    setReportDone(true);
    setTimeout(() => setReportDone(false), 2000);
  };

  const handleBlock = () => {
    setShowBlock(false);
    setIsBlocked(true);
    setBlockDone(true);
    setTimeout(() => setBlockDone(false), 2500);
  };

  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid #F2F4F6', position: 'relative' }}>

      {/* 차단된 사용자 오버레이 */}
      {isBlocked && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(243,243,243,0.88)',
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid #E5E8EB', borderRadius: 12,
            background: 'white', padding: '10px 18px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            <span style={{ fontSize: 14, color: '#8B95A1', fontWeight: 500 }}>
              차단된 사용자의 댓글입니다
            </span>
          </div>
        </div>
      )}

      {/* 헤더: 아바타 + 닉네임 + 날짜 + 더보기 */}
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
        {/* 미트볼 메뉴 */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMoreSheet(v => !v)}
            style={{
              display: 'flex', alignItems: 'center',
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            }}
          >
            <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
              <circle cx="2" cy="2" r="2" fill="#B0B8C1"/>
              <circle cx="8" cy="2" r="2" fill="#B0B8C1"/>
              <circle cx="14" cy="2" r="2" fill="#B0B8C1"/>
            </svg>
          </button>
          {showMoreSheet && (
            <>
              <div onClick={() => setShowMoreSheet(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
              <div style={{
                position: 'absolute', bottom: 40, right: 0, zIndex: 200,
                background: 'rgba(253,253,254,0.89)',
                backdropFilter: 'blur(11px)', WebkitBackdropFilter: 'blur(11px)',
                borderRadius: 20, border: '1px solid rgba(253,253,255,0.75)',
                boxShadow: '0 16px 60px rgba(0,27,55,0.10)',
                minWidth: 160, padding: 4,
              }}>
                <div style={{ padding: '10px 14px 6px', fontSize: 12, fontWeight: 600, color: 'rgba(3,18,40,0.35)' }}>메뉴</div>
                {(review.isMyReview
                  ? [
                      { label: '수정하기', action: () => { setShowMoreSheet(false); onEditReview?.(); } },
                      { label: '삭제하기', action: () => { setShowMoreSheet(false); onDeleteReview?.(); }, danger: true },
                    ]
                  : [
                      { label: '신고하기', action: () => { setShowMoreSheet(false); setShowReport(true); } },
                      { label: '차단하기', action: () => { setShowMoreSheet(false); setShowBlock(true); } },
                    ]
                ).map(item => (
                  <button key={item.label} onClick={item.action} style={{
                    display: 'flex', alignItems: 'center', width: '100%',
                    padding: '12px 14px', borderRadius: 12,
                    textAlign: 'left', background: 'transparent',
                    border: 'none', cursor: 'pointer',
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap', color: (item as any).danger ? '#F04452' : 'rgba(3,18,40,0.70)' }}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 첨부 이미지 – 확장 뷰 */}
      {expandedImgIdx !== null && review.photo_urls && (
        <div style={{
          width: 343, maxWidth: '100%', aspectRatio: '4/3',
          background: '#F2F4F6',
          borderRadius: 6, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', marginBottom: 10,
        }}>
          {review.photo_urls[expandedImgIdx] ? (
            <img src={review.photo_urls[expandedImgIdx]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <CafePlaceholder size="35%" />
          )}
          <button
            onClick={() => setExpandedImgIdx(null)}
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 28, height: 28, borderRadius: 14,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', border: 'none', cursor: 'pointer',
            }}
            aria-label="닫기"
          ><IcX width={11} height={11} style={{ color: 'white', display: 'block' }} /></button>
        </div>
      )}

      {/* 첨부 이미지 – 썸네일 가로 스크롤 */}
      {expandedImgIdx === null && review.photo_urls && review.photo_urls.length > 0 && (
        <div style={{
          display: 'flex', gap: 6, marginBottom: 10,
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {review.photo_urls.map((bg, i) => (
            <div key={i} onClick={() => setExpandedImgIdx(i)} style={{ cursor: 'pointer' }}>
              <PhotoCell bg={bg} size={80} radius={4} />
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
          onClick={async () => {
            // 낙관적 업데이트
            const prevLiked = liked;
            const nextLiked = !prevLiked;
            setLiked(nextLiked);
            setLikeCount(c => nextLiked ? c + 1 : c - 1);
            // DB 동기화
            const dbLiked = await onToggleLike(review.id);
            if (dbLiked !== nextLiked) {
              // 충돌 시 DB 결과로 복원
              setLiked(dbLiked);
              setLikeCount(c => dbLiked ? c + (prevLiked ? 0 : 1) : c - (prevLiked ? 1 : 0));
            }
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

      {/* ── 신고 사유 바텀시트 ── */}
      {showReport && (
        <BottomSheet isOpen onClose={() => setShowReport(false)}>
          <div style={{ padding: '4px 20px 0', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>
              신고 사유를 선택해주세요
            </p>
            {REPORT_REASONS.map(reason => (
              <button
                key={reason}
                onClick={handleReport}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '15px 4px',
                  textAlign: 'left', border: 'none', borderBottom: '1px solid #F2F4F6',
                  background: 'none', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 15, color: '#191F28' }}>{reason}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </BottomSheet>
      )}

      {/* ── 차단 사유 바텀시트 ── */}
      {showBlock && (
        <BottomSheet isOpen onClose={() => setShowBlock(false)}>
          <div style={{ padding: '4px 20px 0', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>
              차단 사유를 선택해주세요
            </p>
            {BLOCK_REASONS.map(reason => (
              <button
                key={reason}
                onClick={handleBlock}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '15px 4px',
                  textAlign: 'left', border: 'none', borderBottom: '1px solid #F2F4F6',
                  background: 'none', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 15, color: '#191F28' }}>{reason}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </BottomSheet>
      )}

      {/* 신고 완료 스낵바 */}
      {reportDone && (
        <Snackbar
          message="신고가 접수됐어요"
          duration={2000}
          onDismiss={() => setReportDone(false)}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          }
        />
      )}

      {/* 차단 완료 스낵바 */}
      {blockDone && (
        <Snackbar
          message={`이제 ${review.author}님의 글은 볼 수 없게 됩니다`}
          duration={2500}
          onDismiss={() => setBlockDone(false)}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          }
        />
      )}
    </div>
  );
}

// ────────── 네이버 지도 웹 URL 생성 ─────────────────────────────
// SDK 규정: 앱 딥링크 사용 금지 → 타사 웹사이트 URL(https://)만 허용
// lat/lng로 정확한 위치를 열고, 없으면 이름+주소 검색으로 폴백
function openKakaoMapWeb(cafe: CafeDetailData) {
  trackMapOpen(cafe.id, cafe.name);
  const query = encodeURIComponent(`${cafe.name} ${cafe.address}`);
  openURL(`https://map.naver.com/v5/search/${query}`);
}

// MorePopup — 배포 시 네이티브 바텀시트로 대체 예정

// ────────── 즐겨찾기 스낵바 ──────────────────────────────────
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
  embedded?: boolean; // 바텀시트 임베드 모드: 하트버튼/backEvent 등록 스킵
  onSwipeDown?: () => void; // embedded 풀스크린 상태에서 아래 스와이프 시 지도 복귀
  showHero?: boolean; // false면 포토 히어로 영역 숨김 (MapPage 기본 바텀시트 상태)
  onFocusModeChange?: (active: boolean) => void; // 사진리뷰/리뷰작성 등 풀스크린 액션 진입 시 true (탭바 숨김 신호)
  onScrollChange?: (scrolled: boolean) => void; // embedded: sticky header 등장 여부 전달
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
    // users 테이블의 nickname 우선 사용, 없을 경우만 UUID 마지막 4자리로 폴백
    author: row.author_nickname?.trim() || `사용자 ${row.user_id.slice(-4)}`,
    avatarColor: avatarColor(row.user_id),
    date: formatDate(row.created_at),
    content: row.content,
    photo_urls: row.photo_urls ?? [],
    likeCount: row.like_count,
    outlet_status: row.outlet_status,
    seat_status: row.seat_status,
    noise_status: row.noise_status,
  };
}

// ── 내 리뷰 수정 페이지 ─────────────────────────────────────
const REVIEW_EVAL_CATEGORIES = [
  { id: 'outlet_status' as const, label: '콘센트', options: ['부족', '적당', '넉넉'] },
  { id: 'seat_status'   as const, label: '좌석',   options: ['불편', '적당', '편안'] },
  { id: 'noise_status'  as const, label: '소음',   options: ['시끄러움', '적당', '조용'] },
];
type ReviewEvalId = 'outlet_status' | 'seat_status' | 'noise_status';
type ReviewEvalState = Partial<Record<ReviewEvalId, string>>;

function EditMyReviewPage({
  reviewId, cafeName, cafeAddress, initialContent, initialPhotos,
  initialOutlet, initialSeat, initialNoise,
  onBack, onClose: _onClose, onSaved,
}: {
  reviewId: string;
  cafeName: string;
  cafeAddress: string;
  initialContent: string;
  initialPhotos: string[];
  initialOutlet: string;
  initialSeat: string;
  initialNoise: string;
  onBack: () => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [text, setText] = useState(initialContent);
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [evalState, setEvalState] = useState<ReviewEvalState>({
    outlet_status: initialOutlet || undefined,
    seat_status:   initialSeat   || undefined,
    noise_status:  initialNoise  || undefined,
  });
  const [saving, setSaving] = useState(false);
  // saved 상태는 상위 reviewEditToast 토스트로 대체되어 제거
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);

  const toggleChip = (id: ReviewEvalId, option: string) => {
    setEvalState(prev => prev[id] === option ? { ...prev, [id]: undefined } : { ...prev, [id]: option });
  };

  const hasChanged = text !== initialContent || photos.join(',') !== initialPhotos.join(',')
    || evalState.outlet_status !== (initialOutlet || undefined)
    || evalState.seat_status   !== (initialSeat   || undefined)
    || evalState.noise_status  !== (initialNoise  || undefined);
  const handleBack = () => { if (hasChanged) { setShowCancelDialog(true); } else { onBack(); } };
  const removePhoto = (idx: number) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const handleGallery = async () => {
    try {
      const remaining = 5 - photos.length;
      const results = await fetchAlbumPhotos({ maxCount: remaining, maxWidth: 1024, base64: true });
      setPhotos(prev => [...prev, ...results.map(r => 'data:image/jpeg;base64,' + r.dataUri)].slice(0, 5));
    } catch {}
    setShowPhotoSheet(false);
  };
  const handleCamera = async () => {
    try {
      const result = await openCamera({ base64: true, maxWidth: 1024 });
      setPhotos(prev => [...prev, 'data:image/jpeg;base64,' + result.dataUri].slice(0, 5));
    } catch {}
    setShowPhotoSheet(false);
  };
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    await updateReview(reviewId, text, photos, {
      outlet_status: evalState.outlet_status ?? '',
      seat_status:   evalState.seat_status   ?? '',
      noise_status:  evalState.noise_status  ?? '',
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f3f3f3', position: 'relative' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}>
        {/* 카페 정보 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #F2F4F6', background: '#f3f3f3' }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cafeName}</p>
            <p style={{ fontSize: 12, color: '#8B95A1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cafeAddress}</p>
          </div>
        </div>

        {/* 평가 칩 */}
        <div style={{ padding: '24px 20px 0', background: '#f3f3f3' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 16 }}>이 카페를 평가해주세요</p>
          {REVIEW_EVAL_CATEGORIES.map(cat => (
            <div key={cat.id} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#4E5968', marginBottom: 10 }}>{cat.label}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {cat.options.map(option => {
                  const isSelected = evalState[cat.id] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => toggleChip(cat.id, option)}
                      style={{
                        flex: 1, height: 40, borderRadius: 20, border: 'none',
                        background: isSelected ? '#252525' : '#E7E8EB',
                        color: isSelected ? '#ffffff' : 'rgba(3,18,40,0.7)',
                        fontSize: 14, fontWeight: isSelected ? 700 : 400,
                        transition: 'all 0.15s', cursor: 'pointer',
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 사진 기록 */}
        <div style={{ padding: '20px 20px 0', background: '#f3f3f3' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#191F28' }}>사진 기록</p>
            <p style={{ fontSize: 12, color: '#B0B8C1' }}>*사진은 최대 5장까지 추가할 수 있어요</p>
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {photos.map((uri, idx) => (
              <div key={idx} style={{ width: 80, height: 80, borderRadius: 8, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                <img src={uri} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <button onClick={() => removePhoto(idx)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2L8 8M8 2L2 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button onClick={() => setShowPhotoSheet(true)} style={{ width: 80, height: 80, borderRadius: 8, flexShrink: 0, border: '1.5px dashed #C9CDD2', background: '#F3F3F3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4V16M4 10H16" stroke="#B0B8C1" strokeWidth="1.8" strokeLinecap="round" /></svg>
                <span style={{ fontSize: 11, color: '#B0B8C1' }}>사진 추가</span>
              </button>
            )}
          </div>
        </div>

        {/* 텍스트 입력 */}
        <div style={{ padding: '20px', background: '#f3f3f3' }}>
          <div style={{ border: '1.5px solid #E5E8EB', borderRadius: 12, padding: '14px', background: '#FAFBFC' }}>
            <textarea
              value={text}
              onChange={e => { if (e.target.value.length <= 200) setText(e.target.value); }}
              rows={5}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 14, color: '#191F28', lineHeight: 1.6, resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => { (e.target.parentElement as HTMLElement).style.borderColor = '#252525'; }}
              onBlur={e => { (e.target.parentElement as HTMLElement).style.borderColor = '#E5E8EB'; }}
            />
            <div style={{ textAlign: 'right', fontSize: 12, color: '#B0B8C1' }}>{text.length}/200</div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={{ display: 'flex', gap: 10, padding: '12px 20px 24px', background: '#f3f3f3' }}>
          <button onClick={handleBack} style={{ flex: 1, height: 52, borderRadius: 12, background: '#EBEBEB', color: '#252525', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer' }}>취소하기</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, height: 52, borderRadius: 12, background: '#252525', color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            등록하기
          </button>
        </div>
      </div>

      {/* 취소 확인 다이얼로그 — DiscardConfirmDialog 공용 컴포넌트 (type='edit') */}
      <DiscardConfirmDialog
        type="edit"
        open={showCancelDialog}
        onDiscard={onBack}
        onContinue={() => setShowCancelDialog(false)}
      />

      {/* 사진 추가 바텀시트 */}
      {showPhotoSheet && (
        <>
          <div onClick={() => setShowPhotoSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderRadius: '16px 16px 0 0', paddingTop: 16, paddingBottom: 'max(16px, env(safe-area-inset-bottom))', zIndex: 201 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E8EB', margin: '0 auto 18px' }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28', padding: '0 20px', marginBottom: 4 }}>사진 추가</p>
            <button onClick={handleGallery} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#191F28' }}>
              <IcPhoto width={20} height={20} style={{ color: '#333D4B', display: 'block' }} /> 갤러리에서 선택
            </button>
            <button onClick={handleCamera} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#191F28' }}>
              <IcCamera width={20} height={20} style={{ color: '#333D4B', display: 'block' }} /> 카메라로 촬영
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function DetailPage({ cafeId, onBack, onClose, activeTab = 'home', onTabChange, scrollToReview, openDirections, embedded = false, onSwipeDown, showHero = true, onFocusModeChange, onScrollChange }: DetailPageProps) {
  const [storeData, setStoreData] = useState<CafeDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const store = await fetchStoreByPlaceId(cafeId);
      if (store) {
        const photoUrls  = store.photo_urls  ?? [];
        const vibeTags   = store.vibe_tags   ?? [];
        const amenities  = store.amenities   ?? [];
        setStoreData({
          id: store.api_place_id,
          name: store.name,
          address: store.address_road,
          location: { lat: store.latitude, lng: store.longitude },
          thumbnailUrl: store.thumbnail_url || undefined,
          photos: photoUrls.length > 0 ? photoUrls : [],
          ...(() => {
            const { hours, regularHoliday } = expandHours(store.business_hours as string | Record<string, unknown> | null);
            return { hours, regularHoliday };
          })(),
          hoursText: typeof store.business_hours === 'string' ? store.business_hours : undefined,
          seats: store.seat_status || undefined,
          outlets: store.outlet_status || undefined,
          vibe: (() => {
            const tags = vibeTags
              .flatMap(t => t.split(/[\n,]+/))
              .map(t => t.trim())
              .filter(Boolean);
            return tags.length > 0 ? tags.join(' · ') : undefined;
          })(),
          priceRange: store.base_price > 0 ? `${store.base_price.toLocaleString()}원~` : undefined,
          phone: store.phone_number ?? undefined,
          snsUrl: store.website_url ?? undefined,
          amenities: (() => {
            const result: Partial<Record<string, boolean>> = {};
            amenities.forEach(a => {
              if (typeof a === 'string') {
                const key = parseAmenityKey(a);
                if (key) result[key] = true;
              }
            });
            return result;
          })(),
          reviews: [],
          closedAt: store.closed_at,
        });
      } else {
        setStoreData(null);
      }
      setLoading(false);
    };
    load();
  }, [cafeId]);

  const cafe = storeData ?? EMPTY_CAFE;
  const scrollRef = useRef<HTMLDivElement>(null);
  const reviewSectionRef = useRef<HTMLDivElement>(null);
  const cafeInfoRef = useRef<HTMLDivElement>(null);
  const { isFavorited, addFavorite, removeFavorite, addRecentlyViewed, userId, collections } = useFavorites();

  // ── DB 리뷰 로딩 + 본인 좋아요 prefetch ──────────────────
  const [dbReviews, setDbReviews] = useState<ReviewItem[]>([]);
  const [likedReviewIds, setLikedReviewIds] = useState<Set<string>>(new Set());
  const loadReviews = useCallback(async () => {
    const rows = await fetchReviews(cafeId);
    const items = rows.map(row => ({
      ...rowToReviewItem(row),
      isMyReview: !!userId && row.user_id === userId,
    }));
    setDbReviews(items);
    // 좋아요 상태 prefetch
    if (userId && items.length > 0) {
      const likedSet = await fetchUserLikedReviewIds(userId, items.map(r => r.id));
      setLikedReviewIds(likedSet);
    } else {
      setLikedReviewIds(new Set());
    }
  }, [cafeId, userId]);
  useEffect(() => { loadReviews(); }, [loadReviews]);

  // 리뷰 좋아요 토글 — DB 동기화 + 로컬 set 갱신
  const handleToggleReviewLike = useCallback(async (reviewId: string): Promise<boolean> => {
    if (!userId) return false;
    const dbResult = await toggleReviewLike(userId, reviewId);
    setLikedReviewIds(prev => {
      const next = new Set(prev);
      if (dbResult) next.add(reviewId); else next.delete(reviewId);
      return next;
    });
    return dbResult;
  }, [userId]);

  const reviews = dbReviews;

  const [scrolled, setScrolled] = useState(false);

  // 상세 화면 진입 시 최근 본 카페 추가 + 즐겨찾기 사진 갱신 (실데이터 로딩 후)
  useEffect(() => {
    if (!storeData) return;
    const allPhotos = [
      ...(storeData.thumbnailUrl ? [storeData.thumbnailUrl] : []),
      ...(storeData.photos ?? []),
    ];
    addRecentlyViewed({
      id: storeData.id,
      name: storeData.name,
      photo: storeData.thumbnailUrl ?? storeData.photos?.[0] ?? '',
      photos: allPhotos.length > 0 ? allPhotos : undefined,
      address: storeData.address,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeData]);

  // 공통 내비게이션 백버튼 — ref 패턴으로 단일 리스너 유지
  // showPhotoReview / showWriteReview 가 state 선언 이후에 있으므로
  // deps에 넣으면 TDZ 에러 → ref를 통해 항상 최신 핸들러를 참조
  const backHandlerRef = useRef<() => void>(() => onBack());
  // embedded(바텀시트 임베드 모드)일 땐 백 이벤트 등록 안 함 — 외부에서 처리
  useBackEvent(() => backHandlerRef.current(), !embedded);

  // 리뷰 섹션으로 자동 스크롤 — 데이터 로딩 완료 후 실행
  useEffect(() => {
    if (!scrollToReview || loading) return;
    setTimeout(() => {
      reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const [hoursExpanded, setHoursExpanded] = useState(false);
  // 토스 미니앱은 토스 로그인 사용자 전용 → 익명 상태 없음. isLoggedIn 분기 제거.

  // showMoreSheet — 배포 시 바텀시트 연결 예정
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showUnfavoriteDialog, setShowUnfavoriteDialog] = useState(false);

  // 가이드북 길찾기 버튼에서 진입 시 네이버맵 웹 바로 열기 (홈/상세와 동일 경로)
  useEffect(() => {
    if (openDirections) {
      setTimeout(() => openKakaoMapWeb(cafe), 150);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [heroIdx, setHeroIdx] = useState(0);
  const heroScrollRef = useRef<HTMLDivElement>(null);

  // 바텀시트 확장 시 (showHero false→true) 스크롤 최상단 고정
  useEffect(() => {
    if (showHero && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [showHero]);

  // ── 네비바 하트 아이콘 (카페 상세페이지 전용) ──────────────
  const heartHandlerRef = useRef<() => void>(() => {});
  const isInAnyCollection = collections.some(col => col.storeIds.includes(cafeId));

  heartHandlerRef.current = () => {
    if (isFavorited(cafeId)) {
      if (isInAnyCollection) {
        setShowUnfavoriteDialog(true);
      } else {
        doRemoveFavorite();
      }
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
  // 하트 클릭 리스너 등록 + 페이지 이탈 시 cleanup
  // embedded(지도 바텀시트) 모드라도 expanded(showHero=true) 상태면
  // 전체화면처럼 동작하므로 네비바 하트 액세서리 활성화.
  const heartActive = !embedded || showHero;
  useEffect(() => {
    if (!heartActive) return undefined;
    try {
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
  }, [heartActive]);

  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [reviewToastVisible, setReviewToastVisible] = useState(false);
  const [reviewEditToastVisible, setReviewEditToastVisible] = useState(false);
  const [showPhotoReview, setShowPhotoReview] = useState(false);
  const [photoStartIndex, setPhotoStartIndex] = useState(0);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [deleteReviewTargetId, setDeleteReviewTargetId] = useState<string | null>(null);
  const [editingMyReview, setEditingMyReview] = useState<{ id: string; content: string; photoUrls: string[]; outlet_status: string; seat_status: string; noise_status: string } | null>(null);

  // 사진리뷰/리뷰작성/리뷰수정 — 탭바를 숨겨야 하는 풀스크린 액션 상태를 부모(App.tsx)에 전파
  useEffect(() => {
    onFocusModeChange?.(showPhotoReview || showWriteReview || !!editingMyReview);
  }, [showPhotoReview, showWriteReview, editingMyReview, onFocusModeChange]);
  // DetailPage 자체가 닫힐 때(unmount) focus 모드를 false로 복구해 탭바를 다시 노출
  useEffect(() => {
    return () => { onFocusModeChange?.(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // backHandlerRef 업데이트 — 항상 최신 상태 반영
  // 자식 페이지(WriteReview/PhotoReview/EditMyReview)는 각자 useBackEvent 를 보유하고 있어
  // 자식이 자체적으로 닫기/다이얼로그 표시를 처리함. 부모가 동시에 닫아버리면
  // 자식의 'discard 다이얼로그' 가 표시될 새 없이 페이지가 언마운트되는 회귀 발생 →
  // 자식이 떠 있는 동안엔 부모 핸들러는 no-op.
  backHandlerRef.current = () => {
    if (showPhotoReview || showWriteReview || editingMyReview) return;
    onBack();
  };

  const [reviewSort, setReviewSort] = useState<'최신순' | '추천순' | '포토리뷰'>('최신순');
  const [reviewSortPopupOpen, setReviewSortPopupOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [favoriteSnackbar, setFavoriteSnackbar] = useState<'added' | 'removed' | null>(null);
  const removedFavoriteRef = useRef<Parameters<typeof addFavorite>[0] | null>(null);

  const isFavorite = isFavorited(cafeId);

  // 찜 상태에 따라 네비바 하트 아이콘 토글
  //   비찜 → icon-heart-whiteline-mono (빈 하트, outline)
  //   찜  → icon-heart-mono           (채워진 하트)
  // addAccessoryButton 을 같은 id 로 재호출하면 아이콘만 교체됨.
  // heartActive 가 false (embedded 이면서 not expanded) 면 등록 X.
  useEffect(() => {
    if (!heartActive) return;
    try {
      partner.addAccessoryButton({
        id: 'heart',
        title: '하트',
        icon: { name: isFavorite ? 'icon-heart-mono' : 'icon-heart-whiteline-mono' },
      });
    } catch { /* noop */ }
  }, [isFavorite, heartActive]);

  const { label: statusLabel, color: statusColor } = getStatusInfo(cafe);
  const todayKey = getTodayKey();

  const handleScroll = () => {
    if (!scrollRef.current) return;
    let next: boolean;
    if (embedded) {
      // embedded: 카페명 h1이 뷰 밖으로 나가는 시점(~60px)에 sticky header 등장
      next = scrollRef.current.scrollTop > 60;
    } else if (cafeInfoRef.current) {
      const containerTop = scrollRef.current.getBoundingClientRect().top;
      const infoBottom = cafeInfoRef.current.getBoundingClientRect().bottom;
      next = infoBottom <= containerTop;
    } else {
      return;
    }
    setScrolled(prev => {
      if (prev !== next) onScrollChange?.(next);
      return next;
    });
  };

  const showFavoriteSnackbar = (type: 'added' | 'removed') => {
    setFavoriteSnackbar(type);
  };

  // 즐겨찾기 제거 + 되돌리기용 데이터 저장
  const doRemoveFavorite = () => {
    removedFavoriteRef.current = {
      id: cafe.id, name: cafe.name, address: cafe.address,
      rating: 0, reviewCount: cafe.reviews.length, photos: cafe.photos ?? [],
    };
    removeFavorite(cafeId);
    showFavoriteSnackbar('removed');
  };

  const handleFavorite = () => {
    if (isFavorite) {
      if (isInAnyCollection) {
        setShowUnfavoriteDialog(true);
      } else {
        doRemoveFavorite();
      }
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
    doRemoveFavorite();
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
  const allReviewPhotos = sortedReviews.flatMap(r => r.photo_urls ?? []);

  // PhotoReviewPage용 ReviewPhoto[] (각 사진에 리뷰 메타데이터 포함)
  const allReviewPhotosFull: ReviewPhoto[] = sortedReviews.flatMap(r =>
    (r.photo_urls ?? []).map(bg => ({
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
  const hasHoursData = Object.keys(cafe.hours).length > 0 || !!cafe.hoursText;

  // 매장 없음
  if (!loading && !storeData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#6B7684' }}>
        <CafePlaceholder size={64} />
        <p style={{ fontSize: 16, fontWeight: 600, color: '#191F28' }}>매장 정보를 찾을 수 없어요</p>
        <p style={{ fontSize: 14 }}>삭제되었거나 존재하지 않는 매장이에요</p>
      </div>
    );
  }

  // 로딩 중 스피너
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f3f3f3' }}>
        <p style={{ fontSize: 14, color: '#8B95A1' }}>불러오는 중...</p>
      </div>
    );
  }

  // 내 리뷰 수정 페이지
  if (editingMyReview) {
    return (
      <EditMyReviewPage
        reviewId={editingMyReview.id}
        cafeName={cafe.name}
        cafeAddress={cafe.address}
        initialContent={editingMyReview.content}
        initialPhotos={editingMyReview.photoUrls}
        initialOutlet={editingMyReview.outlet_status}
        initialSeat={editingMyReview.seat_status}
        initialNoise={editingMyReview.noise_status}
        onBack={() => setEditingMyReview(null)}
        onClose={onClose}
        onSaved={() => { setEditingMyReview(null); loadReviews(); setReviewEditToastVisible(true); }}
      />
    );
  }

  // 리뷰 남기기 페이지
  if (showWriteReview) {
    return (
      <WriteReviewPage
        cafe={{ name: cafe.name, address: cafe.address, thumbnailUrl: cafe.thumbnailUrl }}
        cafeId={cafeId}
        userId={userId}
        onBack={() => setShowWriteReview(false)}
        onClose={onClose}
        onReviewSubmitted={() => { setShowWriteReview(false); loadReviews(); setReviewToastVisible(true); }}
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
        userId={userId}
        initialLikedReviewIds={likedReviewIds}
        onToggleReviewLike={handleToggleReviewLike}
        initialIndex={photoStartIndex >= 0 ? photoStartIndex : undefined}
      />
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#f3f3f3' }}>

      {/* ── 확장(showHero) 모드 닫기 버튼 ── */}
      {embedded && showHero && onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 20,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M13.8151 11.9991L19.4661 6.34814C19.5775 6.23672 19.666 6.10442 19.7264 5.95881C19.7867 5.8132 19.8178 5.65712 19.8179 5.4995C19.8179 5.34187 19.7869 5.18577 19.7266 5.04013C19.6664 4.89448 19.578 4.76213 19.4666 4.65064C19.3551 4.53915 19.2228 4.4507 19.0772 4.39033C18.9316 4.32997 18.7755 4.29887 18.6179 4.29883C18.4603 4.29878 18.3042 4.32978 18.1585 4.39006C18.0129 4.45034 17.8805 4.53872 17.7691 4.65014L12.1181 10.3021L6.46605 4.65014C6.23841 4.43752 5.93706 4.32166 5.62561 4.32701C5.31416 4.33237 5.01698 4.45853 4.79678 4.67885C4.57658 4.89918 4.4506 5.19644 4.44543 5.50789C4.44026 5.81934 4.5563 6.12062 4.76905 6.34814L10.4211 11.9991L4.76905 17.6501C4.60201 17.8183 4.48843 18.0322 4.4426 18.2647C4.39677 18.4973 4.42073 18.7383 4.51147 18.9573C4.60221 19.1763 4.75568 19.3635 4.95258 19.4955C5.14947 19.6275 5.381 19.6984 5.61805 19.6991C5.92505 19.6991 6.23205 19.5821 6.46605 19.3481L12.1181 13.6961L17.7691 19.3481C17.8803 19.4598 18.0126 19.5484 18.1582 19.6088C18.3038 19.6693 18.4599 19.7004 18.6176 19.7004C18.7752 19.7004 18.9313 19.6693 19.0769 19.6088C19.2225 19.5484 19.3548 19.4598 19.4661 19.3481C19.5776 19.2367 19.6661 19.1043 19.7265 18.9587C19.7869 18.813 19.818 18.6568 19.818 18.4991C19.818 18.3414 19.7869 18.1853 19.7265 18.0396C19.6661 17.8939 19.5776 17.7616 19.4661 17.6501L13.8151 11.9991Z" fill="#B0B8C1"/>
          </svg>
        </button>
      )}

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
        onTouchStart={(e) => { (scrollRef.current as any).__touchStartY = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          const startY = (scrollRef.current as any).__touchStartY ?? e.changedTouches[0].clientY;
          const delta = e.changedTouches[0].clientY - startY;
          if (onSwipeDown && scrollRef.current?.scrollTop === 0 && delta > 60) {
            onSwipeDown();
          }
        }}
        style={{ height: '100%', overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}
      >
        {/* 포토 히어로 */}
        {showHero && (() => {
          // thumbnail_url + photo_urls 순서로 히어로 이미지 구성, 없으면 플레이스홀더
          const realImages: string[] = [
            ...(cafe.thumbnailUrl ? [cafe.thumbnailUrl] : []),
            ...(cafe.photos ?? []),
          ];
          const heroImages = realImages.length > 0
            ? realImages.map(url => ({ url }))
            : [
                { url: '' },
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
                      background: img.url ? `url(${img.url}) center/cover no-repeat` : 'linear-gradient(160deg, #6B7684 0%, #4E5968 40%, #252525 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      scrollSnapAlign: 'start',
                    }}
                  >
                    {!img.url && <CafePlaceholder size={100} />}
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

        {/* ── 폐업/휴업 안내 배너 ── */}
        {cafe.closedAt && (
          <div style={{
            margin: '16px 20px 0',
            padding: '14px 16px',
            borderRadius: 12,
            background: '#FFF4F4',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}>
            <IcWarning width={18} height={18} style={{ color: '#D6403C', flexShrink: 0, display: 'block', marginTop: 1 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#D6403C', marginBottom: 2 }}>
                폐업 또는 휴업한 카페예요
              </p>
              <p style={{ fontSize: 12, color: '#8B95A1', lineHeight: 1.4 }}>
                저장한 기록은 그대로 두지만, 방문 전 운영 여부를 다시 확인해 주세요.
              </p>
            </div>
          </div>
        )}

        {/* ── 기본 정보 섹션 ── */}
        <div ref={cafeInfoRef} style={{ padding: '20px 20px 0' }}>
          {/* 카페명 + 닫기 버튼 (embedded 모드) */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#191F28', flex: 1 }}>
              {cafe.name}
            </h1>
            {embedded && !showHero && onClose && (
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8, flexShrink: 0, display: 'flex', alignItems: 'center' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M13.8151 11.9991L19.4661 6.34814C19.5775 6.23672 19.666 6.10442 19.7264 5.95881C19.7867 5.8132 19.8178 5.65712 19.8179 5.4995C19.8179 5.34187 19.7869 5.18577 19.7266 5.04013C19.6664 4.89448 19.578 4.76213 19.4666 4.65064C19.3551 4.53915 19.2228 4.4507 19.0772 4.39033C18.9316 4.32997 18.7755 4.29887 18.6179 4.29883C18.4603 4.29878 18.3042 4.32978 18.1585 4.39006C18.0129 4.45034 17.8805 4.53872 17.7691 4.65014L12.1181 10.3021L6.46605 4.65014C6.23841 4.43752 5.93706 4.32166 5.62561 4.32701C5.31416 4.33237 5.01698 4.45853 4.79678 4.67885C4.57658 4.89918 4.4506 5.19644 4.44543 5.50789C4.44026 5.81934 4.5563 6.12062 4.76905 6.34814L10.4211 11.9991L4.76905 17.6501C4.60201 17.8183 4.48843 18.0322 4.4426 18.2647C4.39677 18.4973 4.42073 18.7383 4.51147 18.9573C4.60221 19.1763 4.75568 19.3635 4.95258 19.4955C5.14947 19.6275 5.381 19.6984 5.61805 19.6991C5.92505 19.6991 6.23205 19.5821 6.46605 19.3481L12.1181 13.6961L17.7691 19.3481C17.8803 19.4598 18.0126 19.5484 18.1582 19.6088C18.3038 19.6693 18.4599 19.7004 18.6176 19.7004C18.7752 19.7004 18.9313 19.6693 19.0769 19.6088C19.2225 19.5484 19.3548 19.4598 19.4661 19.3481C19.5776 19.2367 19.6661 19.1043 19.7265 18.9587C19.7869 18.813 19.818 18.6568 19.818 18.4991C19.818 18.3414 19.7869 18.1853 19.7265 18.0396C19.6661 17.8939 19.5776 17.7616 19.4661 17.6501L13.8151 11.9991Z" fill="#B0B8C1"/>
                </svg>
              </button>
            )}
          </div>

          {/* 주소 + 액션 버튼 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 14, color: '#6B7684', flex: 1, lineHeight: 1.4 }}>
              {cafe.address}
            </p>
            <div style={{ display: 'flex', gap: 8, marginLeft: 10, flexShrink: 0 }}>
              <SubButton label="길 안내" onClick={() => openKakaoMapWeb(cafe)} />
            </div>
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
                const isRegularHoliday = cafe.regularHoliday.includes(day) || h === null;
                const label = isRegularHoliday
                  ? '정기휴무'
                  : h === undefined
                  ? '정보 없음'
                  : `${h.open} - ${h.close}`;
                return (
                  <div key={day} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '5px 0', fontSize: 14,
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? '#252525' : '#4E5968',
                  }}>
                    <span>{day}요일</span>
                    <span style={{ color: isRegularHoliday ? '#8B95A1' : undefined }}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Divider />

        {/* ── 카페 정보 섹션 ── */}
        <div style={{ padding: '20px 20px 4px' }}>
          <SectionHeader title="카페 정보" marginBottom={16} />

          {/* 좌석 | 콘센트 (가로 배치) */}
          <div style={{
            display: 'flex', border: '1px solid #F2F4F6',
            borderRadius: 12, marginBottom: 4, overflow: 'visible',
          }}>
            <InfoBox label="좌석" value={cafe.seats ?? '?'} icon={<IcSeat />} tooltip={"소형카페 : 6 테이블 이하\n중형카페 : 7~15 테이블\n대형카페 : 16 테이블 이상"} />
            <div style={{ width: 1, background: '#F2F4F6' }} />
            <InfoBox label="콘센트" value={cafe.outlets ?? '?'} icon={<IcOutlet />} tooltip={"[넉넉] 거의 사용가능\n[적당] 지정석에 콘센트 보유\n[부족] 0~3개 보유"} />
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
              <SectionHeader title="편의시설" marginBottom={14} />
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
          <div style={{ position: 'relative' }}>
            <SectionHeader
              title={<>리뷰&nbsp;<span style={{ color: '#252525' }}>({reviews.length})</span></>}
              right={
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
              }
              marginBottom={16}
            />
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
                  onMore={() => { setPhotoStartIndex(-1); setShowPhotoReview(true); }}
                  onPhotoClick={i => { setPhotoStartIndex(i); setShowPhotoReview(true); }}
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
                  ? sortedReviews.filter(r => r.photo_urls && r.photo_urls.length > 0)
                  : sortedReviews;
                const visible = showAllReviews ? ordered : ordered.slice(0, 3);
                return (
                  <>
                    {visible.map(review => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        initialLiked={likedReviewIds.has(review.id)}
                        onToggleLike={handleToggleReviewLike}
                        onEditReview={() => setEditingMyReview({ id: review.id, content: review.content, photoUrls: review.photo_urls ?? [], outlet_status: review.outlet_status ?? '', seat_status: review.seat_status ?? '', noise_status: review.noise_status ?? '' })}
                        onDeleteReview={() => setDeleteReviewTargetId(review.id)}
                      />
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
      <Toast
        open={copyToastVisible}
        position="top"
        text="전화번호가 복사됐어요"
        onClose={() => setCopyToastVisible(false)}
      />
      <Toast
        open={reviewToastVisible}
        position="top"
        text="리뷰를 등록했어요"
        onClose={() => setReviewToastVisible(false)}
      />
      <Toast
        open={reviewEditToastVisible}
        position="top"
        text="리뷰가 수정되었어요"
        onClose={() => setReviewEditToastVisible(false)}
      />
      {/* ── 저장/해제 스낵바 ── */}
      {favoriteSnackbar === 'added' && (
        <Snackbar
          type="positive"
          message="카페를 모음집에 담았어요"
          actionLabel="보러가기"
          onAction={() => { onTabChange?.('collection'); setFavoriteSnackbar(null); }}
          onDismiss={() => setFavoriteSnackbar(null)}
        />
      )}
      {favoriteSnackbar === 'removed' && (
        <Snackbar
          type="negative"
          message="카페를 모음집에서 꺼냈어요"
          actionLabel="되돌리기"
          onAction={() => {
            if (removedFavoriteRef.current) {
              addFavorite(removedFavoriteRef.current);
              removedFavoriteRef.current = null;
            }
            setFavoriteSnackbar(null);
          }}
          onDismiss={() => setFavoriteSnackbar(null)}
        />
      )}

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
          title={<ConfirmDialog.Title>카페를 삭제할까요?</ConfirmDialog.Title>}
          description={<ConfirmDialog.Description>담아둔 컬렉션에서도 함께 지워져요.</ConfirmDialog.Description>}
          cancelButton={
            <ConfirmDialog.CancelButton onClick={() => setShowUnfavoriteDialog(false)}>
              닫기
            </ConfirmDialog.CancelButton>
          }
          confirmButton={
            <ConfirmDialog.ConfirmButton color="danger" variant="weak" onClick={handleConfirmUnfavorite}>
              삭제하기
            </ConfirmDialog.ConfirmButton>
          }
          onClose={() => setShowUnfavoriteDialog(false)}
        />
      )}

      {/* ── 내 리뷰 삭제 확인 다이얼로그 ── */}
      {deleteReviewTargetId && (
        <ConfirmDialog
          open={true}
          title={<ConfirmDialog.Title>리뷰를 삭제할까요?</ConfirmDialog.Title>}
          description={<ConfirmDialog.Description>삭제한 리뷰는 복구할 수 없어요.</ConfirmDialog.Description>}
          cancelButton={
            <ConfirmDialog.CancelButton onClick={() => setDeleteReviewTargetId(null)}>
              취소
            </ConfirmDialog.CancelButton>
          }
          confirmButton={
            <ConfirmDialog.ConfirmButton color="danger" variant="weak" onClick={async () => {
              await deleteReview(deleteReviewTargetId);
              setDeleteReviewTargetId(null);
              loadReviews();
            }}>
              삭제하기
            </ConfirmDialog.ConfirmButton>
          }
          onClose={() => setDeleteReviewTargetId(null)}
        />
      )}

      {/* ── 바텀시트들 ── */}

      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        shareTitle={cafe.name}
        onShare={(method) => trackShareCafe(cafe.id, method)}
      />
    </div>
  );
}

import { useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { expandHours, getHoursStatus, getTodayKey, DAY_ORDER } from '../utils/hours';
import { openURL } from '@apps-in-toss/web-framework';
import SectionHeader from '../components/SectionHeader';
import SubButton from '../components/SubButton';
import IcOpen from '../assets/icons/icon_open.svg?react';
import type { PlaceItem } from './MapPage';
import { useFavorites } from '../context/FavoritesContext';
import WriteReviewPage from './WriteReviewPage';

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
      <g clipPath="url(#clip_pets_p)">
        <path d="M18.8552 14.1678L18.6752 13.7358C17.6122 10.9538 14.9772 9.08779 12.0002 9.00879C8.96722 9.09379 6.29622 11.0268 5.26722 13.8808L5.11022 14.2748C3.51522 18.2728 6.14522 21.1238 10.0752 21.1238H13.9332C17.9092 21.1238 20.5382 18.1758 18.8552 14.1678Z" fill="currentColor"/>
        <path d="M20.2254 11.72C21.463 11.72 22.4664 10.6446 22.4664 9.31802C22.4664 7.99143 21.463 6.91602 20.2254 6.91602C18.9877 6.91602 17.9844 7.99143 17.9844 9.31802C17.9844 10.6446 18.9877 11.72 20.2254 11.72Z" fill="currentColor"/>
        <path d="M3.77225 11.72C5.00992 11.72 6.01325 10.6446 6.01325 9.31802C6.01325 7.99143 5.00992 6.91602 3.77225 6.91602C2.53458 6.91602 1.53125 7.99143 1.53125 9.31802C1.53125 10.6446 2.53458 11.72 3.77225 11.72Z" fill="currentColor"/>
        <path d="M8.81378 8.05198C10.1326 8.05198 11.2018 6.89329 11.2018 5.46398C11.2018 4.03466 10.1326 2.87598 8.81378 2.87598C7.49492 2.87598 6.42578 4.03466 6.42578 5.46398C6.42578 6.89329 7.49492 8.05198 8.81378 8.05198Z" fill="currentColor"/>
        <path d="M15.1849 8.05198C16.5037 8.05198 17.5729 6.89329 17.5729 5.46398C17.5729 4.03466 16.5037 2.87598 15.1849 2.87598C13.866 2.87598 12.7969 4.03466 12.7969 5.46398C12.7969 6.89329 13.866 8.05198 15.1849 8.05198Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip_pets_p"><rect width="24" height="24" fill="white"/></clipPath>
      </defs>
    </svg>
  );
}
function IcTimerOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_timeroff_p)">
        <path d="M18.7787 18.211C18.7787 16.4248 17.7588 14.7958 16.152 14.0158L13.2168 12.5908C12.8904 12.4324 12.7542 12.0394 12.9126 11.713C12.9768 11.5804 13.0842 11.4736 13.2168 11.4088L16.1525 9.9838C17.7593 9.2038 18.7787 7.5742 18.7787 5.7886V2.5498H5.21875V5.7886C5.21875 7.5748 6.23875 9.2038 7.84555 9.9838L10.7814 11.4088C11.1078 11.5672 11.244 11.9602 11.0856 12.2866C11.0214 12.4192 10.914 12.526 10.7814 12.5908L7.84495 14.0158C6.23815 14.7958 5.21875 16.4254 5.21875 18.211V21.4498H18.7787V18.211Z" fill="currentColor"/>
        <path d="M18.78 21.4502H5.21875C4.80475 21.4502 4.46875 21.7862 4.46875 22.2002C4.46875 22.6142 4.80475 22.9502 5.21875 22.9502H18.78C19.1939 22.9502 19.5299 22.6142 19.5299 22.2002C19.5299 21.7862 19.1939 21.4502 18.78 21.4502Z" fill="currentColor"/>
        <path d="M18.78 2.5498C19.1939 2.5498 19.5299 2.2138 19.5299 1.7998C19.5299 1.3858 19.1939 1.0498 18.78 1.0498H5.21875C4.80475 1.0498 4.46875 1.3858 4.46875 1.7998C4.46875 2.2138 4.80475 2.5498 5.21875 2.5498H18.78Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip_timeroff_p"><rect width="24" height="24" fill="white"/></clipPath>
      </defs>
    </svg>
  );
}
function IcPublicToilet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_wc_p)">
        <path d="M17.1016 2.09961H6.90156C4.2506 2.09961 2.10156 4.24864 2.10156 6.89961V17.0996C2.10156 19.7506 4.2506 21.8996 6.90156 21.8996H17.1016C19.7525 21.8996 21.9016 19.7506 21.9016 17.0996V6.89961C21.9016 4.24864 19.7525 2.09961 17.1016 2.09961Z" fill="currentColor"/>
        <path d="M10.1164 16.5447L11.824 11.7063C11.8802 11.5468 11.8974 11.3762 11.874 11.2087C11.8507 11.0412 11.7875 10.8817 11.6899 10.7437C11.5922 10.6057 11.4629 10.4931 11.3127 10.4153C11.1625 10.3376 10.9959 10.2969 10.8268 10.2969H7.41281C7.24371 10.2969 7.0771 10.3376 6.92693 10.4153C6.77676 10.4931 6.64742 10.6057 6.54975 10.7437C6.45208 10.8817 6.38893 11.0412 6.36559 11.2087C6.34225 11.3762 6.35941 11.5468 6.41561 11.7063L8.12261 16.5447C8.19542 16.7509 8.33039 16.9295 8.50894 17.0558C8.68748 17.1821 8.90081 17.2499 9.11951 17.2499C9.33822 17.2499 9.55154 17.1821 9.73009 17.0558C9.90863 16.9295 10.0436 16.7509 10.1164 16.5447Z" fill="#F9FAFB"/>
        <path d="M13.885 10.8088L12.1774 15.6478C12.1211 15.8072 12.104 15.9778 12.1273 16.1453C12.1506 16.3127 12.2138 16.4722 12.3115 16.6102C12.4092 16.7482 12.5385 16.8607 12.6887 16.9384C12.8389 17.0161 13.0055 17.0566 13.1746 17.0566H16.5886C16.7576 17.0566 16.9243 17.0161 17.0744 16.9384C17.2246 16.8607 17.354 16.7482 17.4517 16.6102C17.5493 16.4722 17.6125 16.3127 17.6358 16.1453C17.6592 15.9778 17.642 15.8072 17.5858 15.6478L15.8788 10.8088C15.806 10.6025 15.671 10.424 15.4924 10.2977C15.3139 10.1713 15.1006 10.1035 14.8819 10.1035C14.6632 10.1035 14.4498 10.1713 14.2713 10.2977C14.0928 10.424 13.9578 10.6025 13.885 10.8088Z" fill="#F9FAFB"/>
        <path d="M9.11812 9.33098C9.83057 9.33098 10.4081 8.75342 10.4081 8.04098C10.4081 7.32853 9.83057 6.75098 9.11812 6.75098C8.40568 6.75098 7.82812 7.32853 7.82812 8.04098C7.82812 8.75342 8.40568 9.33098 9.11812 9.33098Z" fill="#F9FAFB"/>
        <path d="M14.8798 9.33098C15.5923 9.33098 16.1698 8.75342 16.1698 8.04098C16.1698 7.32853 15.5923 6.75098 14.8798 6.75098C14.1674 6.75098 13.5898 7.32853 13.5898 8.04098C13.5898 8.75342 14.1674 9.33098 14.8798 9.33098Z" fill="#F9FAFB"/>
      </g>
      <defs>
        <clipPath id="clip_wc_p"><rect width="24" height="24" fill="white"/></clipPath>
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
      <g clipPath="url(#clip_people_p)">
        <path fillRule="evenodd" clipRule="evenodd" d="M7.5 11.6475C7.99246 11.6475 8.48009 11.5505 8.93506 11.362C9.39003 11.1736 9.80343 10.8973 10.1517 10.5491C10.4999 10.2009 10.7761 9.78749 10.9645 9.33252C11.153 8.87755 11.25 8.38992 11.25 7.89746C11.25 7.405 11.153 6.91737 10.9645 6.4624C10.7761 6.00743 10.4999 5.59403 10.1517 5.24581C9.80343 4.89759 9.39003 4.62137 8.93506 4.43291C8.48009 4.24446 7.99246 4.14746 7.5 4.14746C6.50544 4.14746 5.55161 4.54255 4.84835 5.24581C4.14509 5.94907 3.75 6.9029 3.75 7.89746C3.75 8.89202 4.14509 9.84585 4.84835 10.5491C5.55161 11.2524 6.50544 11.6475 7.5 11.6475ZM8 17.8285C8 16.5645 8.771 14.6935 10.48 13.2765C9.637 12.9795 8.652 12.7935 7.5 12.7935C2.46 12.7935 0.5 16.2315 0.5 17.8285C0.5 19.4285 4.673 19.8525 7.5 19.8525C7.971 19.8525 8.48 19.8395 9.001 19.8125C8.34 19.2855 8 18.6255 8 17.8285Z" fill="currentColor"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M16.5 12.7945C11.46 12.7945 9.5 16.2315 9.5 17.8295C9.5 19.4275 13.673 19.8535 16.5 19.8535C19.327 19.8535 23.5 19.4275 23.5 17.8295C23.5 16.2315 21.54 12.7945 16.5 12.7945ZM16.5 11.6475C16.9925 11.6475 17.4801 11.5505 17.9351 11.362C18.39 11.1736 18.8034 10.8973 19.1517 10.5491C19.4999 10.2009 19.7761 9.78749 19.9645 9.33252C20.153 8.87755 20.25 8.38992 20.25 7.89746C20.25 7.405 20.153 6.91737 19.9645 6.4624C19.7761 6.00743 19.4999 5.59403 19.1517 5.24581C18.8034 4.89759 18.39 4.62137 17.9351 4.43291C17.4801 4.24446 16.9925 4.14746 16.5 4.14746C15.5054 4.14746 14.5516 4.54255 13.8483 5.24581C13.1451 5.94907 12.75 6.9029 12.75 7.89746C12.75 8.89202 13.1451 9.84585 13.8483 10.5491C14.5516 11.2524 15.5054 11.6475 16.5 11.6475Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip_people_p"><rect width="24" height="24" fill="white"/></clipPath>
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
function IcLaptop() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M21.5 2.59863H2.5C1.948 2.59863 1.5 3.04663 1.5 3.59863V17.5986C1.5 18.1506 1.948 18.5986 2.5 18.5986L9.061 18.5996L7.627 21.6906C7.473 22.0216 7.715 22.4006 8.081 22.4006H15.921C16.286 22.4006 16.528 22.0216 16.375 21.6906L14.939 18.5996L21.5 18.5986C22.052 18.5986 22.5 18.1506 22.5 17.5986V3.59863C22.5 3.04563 22.052 2.59863 21.5 2.59863ZM20.5 16.5986H3.5V4.59863H20.5V16.5986Z" fill="currentColor"/>
      <path d="M4.5 5.59863H19.5V15.5986H4.5V5.59863Z" fill="currentColor"/>
    </svg>
  );
}
function IcTicket() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M20.7158 12C20.7158 10.903 21.6048 10.014 22.7008 10.014V5.501C22.7008 4.672 22.0288 4 21.1998 4H2.80178C1.97278 4 1.30078 4.672 1.30078 5.501V10.014C2.39778 9.979 3.31478 10.84 3.34978 11.937C3.38478 13.034 2.52378 13.951 1.42678 13.986C1.38478 13.987 1.34278 13.987 1.30078 13.986V18.499C1.30078 19.328 1.97278 20 2.80178 20H21.2008C22.0298 20 22.7018 19.328 22.7018 18.499V13.986C21.6048 13.986 20.7158 13.097 20.7158 12ZM15.8298 11.115L14.1438 12.759L14.5418 15.08C14.5858 15.337 14.3158 15.533 14.0848 15.412L12.0008 14.316L9.91678 15.413C9.68578 15.534 9.41578 15.338 9.45978 15.081L9.85678 12.759L8.17078 11.115C7.98378 10.933 8.08678 10.616 8.34478 10.578L10.6758 10.239L11.7188 8.127C11.8338 7.893 12.1678 7.893 12.2828 8.127L13.3258 10.239L15.6558 10.578C15.9138 10.616 16.0168 10.933 15.8298 11.115Z" fill="currentColor"/>
    </svg>
  );
}

// ── 편의시설 설정 ─────────────────────────────────────────────
const AMENITY_CONFIG: Record<string, { icon: ReactNode; label: string }> = {
  parking:          { icon: <IcParking />,      label: '주차' },
  pets:             { icon: <IcPets />,          label: '반려동물 동반' },
  noTimeLimit:      { icon: <IcTimerOff />,      label: '시간 제한 없음' },
  separateRestroom: { icon: <IcPublicToilet />,  label: '남/녀 화장실 구분' },
  indoorRestroom:   { icon: <IcToilet />,        label: '내부화장실' },
  groupVisit:       { icon: <IcPeople />,        label: '단체 방문 가능' },
  coffeeMachine:    { icon: <IcCoffee />,        label: '커피머신' },
  wifi:             { icon: <IcWifi />,          label: '무선 인터넷' },
  wheelchair:       { icon: <IcWheelchair />,    label: '휠체어 이용' },
};

// 영어 키 또는 한국어 문자열 → AMENITY_CONFIG 키 변환
function parseAmenityKey(raw: string): string | null {
  const KNOWN_KEYS = new Set(Object.keys(AMENITY_CONFIG));
  if (KNOWN_KEYS.has(raw)) return raw;
  const s = raw.replace(/\s/g, '');
  if (/주차/.test(s))                                         return 'parking';
  if (/시간제한없|무제한/.test(s))                            return 'noTimeLimit';
  if (/남.?녀화장실구분|남.?여화장실구분|화장실구분/.test(s)) return 'separateRestroom';
  if (/내부화장실/.test(s))                                   return 'indoorRestroom';
  if (/단체방문/.test(s))                                     return 'groupVisit';
  if (/반려동물/.test(s))                                     return 'pets';
  if (/커피머신/.test(s))                                     return 'coffeeMachine';
  if (/무선인터넷|와이파이|wifi/i.test(s))                    return 'wifi';
  if (/휠체어/.test(s))                                       return 'wheelchair';
  return null;
}

// ── 서브 컴포넌트 ─────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 8, background: '#F2F4F6' }} />;
}

function InfoBox({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div style={{ flex: 1, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        {icon}
        <p style={{ fontSize: 12, color: '#8B95A1' }}>{label}</p>
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#191F28' }}>{value}</p>
    </div>
  );
}

function InfoRow({ label, value, isLink }: { label: string; value?: string; isLink?: boolean }) {
  const displayValue = value ?? '-';
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid #F3F3F3',
    }}>
      <span style={{ fontSize: 14, color: '#8B95A1', width: 60, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        {isLink && value ? (
          <button
            onClick={() => openURL(value)}
            style={{ fontSize: 14, color: '#252525', overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', maxWidth: 220, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'right' }}
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
            <IcOpen width={16} height={16} style={{ color: '#6B7684', display: 'block' }} />
          </button>
        )}
      </div>
    </div>
  );
}

function AmenityBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div style={{
      width: 50, height: 50, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 3, color: '#333D4B',
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 500, color: '#4E5968', textAlign: 'center', lineHeight: 1.2, display: 'block', minHeight: 24 }}>{label}</span>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
interface PlaceDetailPageProps {
  place: PlaceItem;
  onBack: () => void;
  showHero?: boolean;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function PlaceDetailPage({ place, onBack, showHero = true }: PlaceDetailPageProps) {
  const [heroIdx, setHeroIdx] = useState(0);
  const heroScrollRef = useRef<HTMLDivElement>(null);
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const { requireNickname, userId } = useFavorites();

  const handleScroll = () => {
    if (!scrollRef.current) return;
    setScrolled(scrollRef.current.scrollTop > 60);
  };
  const placeLabel = place.placeType === 'library' ? '도서관' : '공유공간';

  const { hours, regularHoliday } = expandHours(place.businessHours ?? null);
  const hasHoursData = Object.keys(hours).length > 0 || !!place.businessHours;
  const { label: statusLabel, color: statusColor } = getHoursStatus(hours, regularHoliday);
  const todayKey = getTodayKey();
  const todayHours = hours[todayKey];

  const heroImages: string[] = [
    ...(place.thumbnailUrl ? [place.thumbnailUrl] : []),
    ...(place.photos ?? []),
  ];

  // 편의시설 키 배열로 변환
  const amenityKeys: string[] = [];
  if (place.amenities) {
    for (const raw of place.amenities) {
      const key = parseAmenityKey(raw);
      if (key) amenityKeys.push(key);
    }
  }

  const facilitiesText = place.facilities?.join(', ') || undefined;

  const openNaverMap = () => {
    const name = encodeURIComponent(place.name);
    openURL(`nmap://navigation?dlat=${place.lat}&dlng=${place.lng}&dname=${name}&appname=kr.co.zido.kagong`);
  };

  const handleOpenWriteReview = async () => {
    const ok = await requireNickname();
    if (!ok) return;
    setShowWriteReview(true);
  };

  if (showWriteReview) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#f3f3f3' }}>
        <WriteReviewPage
          cafe={{ name: place.name, address: place.address, thumbnailUrl: place.thumbnailUrl ?? '' }}
          cafeId={place.id}
          userId={userId}
          onBack={() => setShowWriteReview(false)}
          onClose={onBack}
          onReviewSubmitted={() => setShowWriteReview(false)}
        />
      </div>
    );
  }

  const CloseBtn = () => (
    <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M13.8151 11.9991L19.4661 6.34814C19.5775 6.23672 19.666 6.10442 19.7264 5.95881C19.7867 5.8132 19.8178 5.65712 19.8179 5.4995C19.8179 5.34187 19.7869 5.18577 19.7266 5.04013C19.6664 4.89448 19.578 4.76213 19.4666 4.65064C19.3551 4.53915 19.2228 4.4507 19.0772 4.39033C18.9316 4.32997 18.7755 4.29887 18.6179 4.29883C18.4603 4.29878 18.3042 4.32978 18.1585 4.39006C18.0129 4.45034 17.8805 4.53872 17.7691 4.65014L12.1181 10.3021L6.46605 4.65014C6.23841 4.43752 5.93706 4.32166 5.62561 4.32701C5.31416 4.33237 5.01698 4.45853 4.79678 4.67885C4.57658 4.89918 4.4506 5.19644 4.44543 5.50789C4.44026 5.81934 4.5563 6.12062 4.76905 6.34814L10.4211 11.9991L4.76905 17.6501C4.60201 17.8183 4.48843 18.0322 4.4426 18.2647C4.39677 18.4973 4.42073 18.7383 4.51147 18.9573C4.60221 19.1763 4.75568 19.3635 4.95258 19.4955C5.14947 19.6275 5.381 19.6984 5.61805 19.6991C5.92505 19.6991 6.23205 19.5821 6.46605 19.3481L12.1181 13.6961L17.7691 19.3481C17.8803 19.4598 18.0126 19.5484 18.1582 19.6088C18.3038 19.6693 18.4599 19.7004 18.6176 19.7004C18.7752 19.7004 18.9313 19.6693 19.0769 19.6088C19.2225 19.5484 19.3548 19.4598 19.4661 19.3481C19.5776 19.2367 19.6661 19.1043 19.7265 18.9587C19.7869 18.813 19.818 18.6568 19.818 18.4991C19.818 18.3414 19.7869 18.1853 19.7265 18.0396C19.6661 17.8939 19.5776 17.7616 19.4661 17.6501L13.8151 11.9991Z" fill="#B0B8C1"/>
      </svg>
    </button>
  );

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#f3f3f3' }}>
      {/* 확장 모드 닫기 버튼 */}
      {showHero && (
        <button onClick={onBack} style={{
          position: 'absolute', top: 16, right: 20, zIndex: 99,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M13.8151 11.9991L19.4661 6.34814C19.5775 6.23672 19.666 6.10442 19.7264 5.95881C19.7867 5.8132 19.8178 5.65712 19.8179 5.4995C19.8179 5.34187 19.7869 5.18577 19.7266 5.04013C19.6664 4.89448 19.578 4.76213 19.4666 4.65064C19.3551 4.53915 19.2228 4.4507 19.0772 4.39033C18.9316 4.32997 18.7755 4.29887 18.6179 4.29883C18.4603 4.29878 18.3042 4.32978 18.1585 4.39006C18.0129 4.45034 17.8805 4.53872 17.7691 4.65014L12.1181 10.3021L6.46605 4.65014C6.23841 4.43752 5.93706 4.32166 5.62561 4.32701C5.31416 4.33237 5.01698 4.45853 4.79678 4.67885C4.57658 4.89918 4.4506 5.19644 4.44543 5.50789C4.44026 5.81934 4.5563 6.12062 4.76905 6.34814L10.4211 11.9991L4.76905 17.6501C4.60201 17.8183 4.48843 18.0322 4.4426 18.2647C4.39677 18.4973 4.42073 18.7383 4.51147 18.9573C4.60221 19.1763 4.75568 19.3635 4.95258 19.4955C5.14947 19.6275 5.381 19.6984 5.61805 19.6991C5.92505 19.6991 6.23205 19.5821 6.46605 19.3481L12.1181 13.6961L17.7691 19.3481C17.8803 19.4598 18.0126 19.5484 18.1582 19.6088C18.3038 19.6693 18.4599 19.7004 18.6176 19.7004C18.7752 19.7004 18.9313 19.6693 19.0769 19.6088C19.2225 19.5484 19.3548 19.4598 19.4661 19.3481C19.5776 19.2367 19.6661 19.1043 19.7265 18.9587C19.7869 18.813 19.818 18.6568 19.818 18.4991C19.818 18.3414 19.7869 18.1853 19.7265 18.0396C19.6661 17.8939 19.5776 17.7616 19.4661 17.6501L13.8151 11.9991Z" fill="#B0B8C1"/>
          </svg>
        </button>
      )}

      {/* 스크롤 시 노출되는 상단 sticky 헤더 */}
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
          {place.name}
        </p>
        <p style={{ fontSize: 13, color: '#6B7684', marginBottom: hasHoursData ? 6 : 0, lineHeight: 1.4 }}>
          {place.address}
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

      {/* 스크롤 컨텐츠 */}
      <div ref={scrollRef} onScroll={handleScroll} style={{
        height: '100%', overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 'calc(100% + 200px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}>
      {/* 히어로 이미지 슬라이더 */}
      {showHero && (
        <div style={{ height: 260, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
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
            {heroImages.length > 0 ? heroImages.map((url, i) => (
              <div key={i} style={{
                flexShrink: 0, width: '100%', height: '100%',
                background: `url(${url}) center/cover no-repeat`,
                scrollSnapAlign: 'start',
              }} />
            )) : (
              <div style={{
                flexShrink: 0, width: '100%', height: '100%',
                background: 'linear-gradient(160deg, #6B7684 0%, #4E5968 40%, #252525 100%)',
                scrollSnapAlign: 'start',
              }} />
            )}
          </div>
          {/* 상단 그라디언트 */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 120,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />
          {/* 인디케이터 */}
          {heroImages.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 6, pointerEvents: 'none',
            }}>
              {heroImages.map((_, i) => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: i === heroIdx ? 'white' : 'rgba(255,255,255,0.4)',
                  transition: 'background 0.2s',
                }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 이름 + 주소 + 길안내 + 운영시간 */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#191F28', margin: 0, flex: 1 }}>{place.name}</h1>
          {!showHero && <CloseBtn />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ fontSize: 14, color: '#6B7684', flex: 1, lineHeight: 1.4 }}>{place.address}</p>
          <div style={{ display: 'flex', gap: 8, marginLeft: 10, flexShrink: 0 }}>
            <SubButton label="길 안내" onClick={openNaverMap} />
          </div>
        </div>
        {hasHoursData && (
          <button
            onClick={() => setHoursExpanded(e => !e)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', textAlign: 'left', padding: '4px 0 16px',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <span style={{
              fontSize: 13, fontWeight: 700, color: statusColor,
              background: `${statusColor}18`, borderRadius: 6, padding: '3px 8px',
            }}>
              {statusLabel}
            </span>
            {todayHours && (
              <span style={{ fontSize: 13, color: '#6B7684' }}>
                {todayHours.open} - {todayHours.close}
              </span>
            )}
            {statusLabel === '휴무' && (
              <span style={{ fontSize: 13, color: '#8B95A1' }}>오늘은 휴무예요</span>
            )}
            {Object.keys(hours).length > 0 && (
              <span style={{ marginLeft: 'auto' }}>
                <ChevronIcon expanded={hoursExpanded} />
              </span>
            )}
          </button>
        )}
        {hoursExpanded && Object.keys(hours).length > 0 && (
          <div style={{
            background: '#F3F3F3', borderRadius: 12,
            padding: '12px 16px', marginBottom: 16,
          }}>
            {DAY_ORDER.map(day => {
              const h = hours[day];
              const isToday = day === todayKey;
              const isHoliday = regularHoliday.includes(day) || h === null;
              const label = isHoliday
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
                  <span style={{ color: isHoliday ? '#8B95A1' : undefined }}>{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Divider />

      {/* 장소 정보 섹션 (카페 정보와 동일 구조) */}
      <div style={{ padding: '20px 20px 4px' }}>
        <SectionHeader title="장소 정보" marginBottom={16} />

        {/* 노트북 | 입장 조건 (가로 배치) */}
        {(place.ltSeatStatus || place.entCondition) && (
          <div style={{
            display: 'flex', border: '1px solid #F2F4F6',
            borderRadius: 12, marginBottom: 4, overflow: 'visible',
          }}>
            <InfoBox label="노트북" value={place.ltSeatStatus ?? '?'} icon={<IcLaptop />} />
            <div style={{ width: 1, background: '#F2F4F6' }} />
            <InfoBox label="입장 조건" value={place.entCondition ?? '?'} icon={<IcTicket />} />
          </div>
        )}

        {/* 기타 정보 세로 나열 */}
        <InfoRow label="시설" value={facilitiesText} />
        <InfoRow label="입장료" value={place.entPrice} />
        <InfoRow label="연락처" value={place.phone} />
        <InfoRow label="웹사이트" value={place.websiteUrl} isLink />
      </div>

      <Divider />

      {/* 편의시설 섹션 */}
      {amenityKeys.length > 0 && (
        <>
          <div style={{ padding: '20px 16px' }}>
            <SectionHeader title="편의시설" marginBottom={14} />
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
                {amenityKeys.map(key => {
                  const cfg = AMENITY_CONFIG[key];
                  if (!cfg) return null;
                  return <AmenityBadge key={key} icon={cfg.icon} label={cfg.label} />;
                })}
              </div>
            </div>
          </div>
          <Divider />
        </>
      )}

      {/* 리뷰 섹션 */}
      <div style={{ padding: '20px' }}>
        <SectionHeader title={<>리뷰&nbsp;<span style={{ color: '#252525' }}>(0)</span></>} marginBottom={16} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#191F28', marginBottom: 4 }}>아직 리뷰가 없어요!</p>
            <p style={{ fontSize: 13, color: '#8B95A1' }}>{place.name}에 첫 번째로 리뷰를 남겨보세요</p>
          </div>
          <button
            onClick={handleOpenWriteReview}
            style={{
              width: '100%', height: 38, borderRadius: 10,
              backgroundColor: '#252525', color: '#ffffff',
              fontSize: 15, fontWeight: 590, border: 'none', cursor: 'pointer',
            }}
          >
            리뷰 쓰기
          </button>
        </div>
      </div>

      <div style={{ height: 40 }} />
      </div>
    </div>
    </div>
  );
}

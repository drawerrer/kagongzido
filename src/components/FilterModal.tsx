import { useState } from 'react';
import type { ReactNode } from 'react';

// ── 옵션 칩 TDS SVG 아이콘 ─────────────────────
function FiOutlet() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_plug_filter)">
        <path d="M8.72512 8.01953L7.91992 8.01953L7.91992 2.79113C7.91992 2.68452 7.96228 2.58226 8.03767 2.50688C8.11306 2.43149 8.21531 2.38913 8.32192 2.38913C8.42854 2.38913 8.53079 2.43149 8.60618 2.50688C8.68157 2.58226 8.72392 2.68452 8.72392 2.79113L8.72512 8.01953Z" fill="currentColor"/>
        <path d="M6.99463 2.79051L6.99463 8.94531L9.65143 8.94531L9.65143 2.79051C9.65143 2.4382 9.51147 2.10032 9.26235 1.85119C9.01323 1.60207 8.67534 1.46211 8.32303 1.46211C7.97072 1.46211 7.63283 1.60207 7.38371 1.85119C7.13459 2.10032 6.99463 2.4382 6.99463 2.79051Z" fill="currentColor"/>
        <path d="M16.1532 8.01953L15.3486 8.01953L15.3486 2.79113C15.3527 2.68712 15.3968 2.58871 15.4718 2.51655C15.5468 2.44438 15.6468 2.40407 15.7509 2.40407C15.855 2.40407 15.9551 2.44438 16.0301 2.51655C16.1051 2.58871 16.1492 2.68712 16.1532 2.79113L16.1532 8.01953Z" fill="currentColor"/>
        <path d="M14.4224 2.79051L14.4224 8.94531L17.0798 8.94531L17.0798 2.79051C17.0724 2.44301 16.9291 2.11223 16.6808 1.86907C16.4324 1.62592 16.0986 1.48975 15.7511 1.48975C15.4035 1.48975 15.0697 1.62592 14.8214 1.86907C14.573 2.11223 14.4297 2.44301 14.4224 2.79051Z" fill="currentColor"/>
        <path d="M19.6537 7.56985L4.42089 7.56985C4.25735 7.56978 4.09539 7.60192 3.94427 7.66445C3.79315 7.72698 3.65583 7.81868 3.54016 7.93429C3.42449 8.04991 3.33273 8.18719 3.27012 8.33828C3.20752 8.48936 3.17529 8.65131 3.17529 8.81485L3.17529 10.9395L20.8987 10.9395L20.8987 8.81485C20.8987 8.65136 20.8665 8.48946 20.8039 8.33841C20.7414 8.18736 20.6496 8.05011 20.534 7.93451C20.4184 7.8189 20.2812 7.72719 20.1301 7.66462C19.9791 7.60206 19.8172 7.56985 19.6537 7.56985Z" fill="currentColor"/>
        <path d="M15.1051 22.4629L8.96949 22.4629C8.72866 22.463 8.49304 22.3928 8.29157 22.2608C8.09011 22.1289 7.93159 21.9409 7.83549 21.7201L3.17529 10.9399L20.8987 10.9399L16.2385 21.7201C16.1425 21.9409 15.9841 22.1288 15.7827 22.2608C15.5814 22.3927 15.3458 22.463 15.1051 22.4629Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip_plug_filter">
          <rect width="24" height="24" fill="white" transform="translate(1.04907e-06 24) rotate(-90)"/>
        </clipPath>
      </defs>
    </svg>
  );
}
function FiSoundOn() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_soundon_filter)">
        <path d="M5.39979 16.0096H1.70979C1.19979 16.0096 0.779785 15.5896 0.779785 15.0796V8.91962C0.779785 8.40962 1.19979 7.98962 1.70979 7.98962H5.39979V16.0096ZM5.39979 16.0096V7.98962L13.5498 2.66962C14.2698 2.19962 15.2198 2.71962 15.2198 3.56962V20.4096C15.2198 21.2696 14.2698 21.7796 13.5498 21.3096L5.39979 16.0096Z" fill="currentColor"/>
        <path d="M20.24 6.55078C21.47 7.99078 22.23 9.92078 22.23 12.0508C22.23 14.1808 21.48 16.1108 20.24 17.5508M17.77 9.25078C18.37 10.0008 18.74 10.9808 18.74 12.0508C18.74 13.1208 18.38 14.1008 17.77 14.8508" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip_soundon_filter">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}
function FiSoundOff() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_soundoff_filter)">
        <path d="M18 14.5L23 9.5M18 9.5L23 14.5" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
        <path d="M5.39979 16.0096H1.70979C1.19979 16.0096 0.779785 15.5896 0.779785 15.0796V8.91962C0.779785 8.40962 1.19979 7.98962 1.70979 7.98962H5.39979V16.0096ZM5.39979 16.0096V7.98962L13.5498 2.66962C14.2698 2.19962 15.2198 2.71962 15.2198 3.56962V20.4096C15.2198 21.2696 14.2698 21.7796 13.5498 21.3096L5.39979 16.0096Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip_soundoff_filter">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}
function FiPublicToilet() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_wc_filter)">
        <path d="M17.1001 2.09961H6.9001C4.24913 2.09961 2.1001 4.24864 2.1001 6.89961V17.0996C2.1001 19.7506 4.24913 21.8996 6.9001 21.8996H17.1001C19.7511 21.8996 21.9001 19.7506 21.9001 17.0996V6.89961C21.9001 4.24864 19.7511 2.09961 17.1001 2.09961Z" fill="currentColor"/>
        <path d="M10.1164 16.5447L11.824 11.7063C11.8802 11.5468 11.8974 11.3762 11.874 11.2087C11.8507 11.0412 11.7875 10.8817 11.6899 10.7437C11.5922 10.6057 11.4629 10.4931 11.3127 10.4153C11.1625 10.3376 10.9959 10.2969 10.8268 10.2969H7.41281C7.24371 10.2969 7.0771 10.3376 6.92693 10.4153C6.77676 10.4931 6.64742 10.6057 6.54975 10.7437C6.45208 10.8817 6.38893 11.0412 6.36559 11.2087C6.34225 11.3762 6.35941 11.5468 6.41561 11.7063L8.12261 16.5447C8.19542 16.7509 8.33039 16.9295 8.50894 17.0558C8.68748 17.1821 8.90081 17.2499 9.11951 17.2499C9.33822 17.2499 9.55154 17.1821 9.73009 17.0558C9.90863 16.9295 10.0436 16.7509 10.1164 16.5447Z" fill="#f3f3f3"/>
        <path d="M13.883 10.8088L12.1754 15.6478C12.1192 15.8072 12.102 15.9778 12.1254 16.1453C12.1487 16.3127 12.2118 16.4722 12.3095 16.6102C12.4072 16.7482 12.5366 16.8607 12.6867 16.9384C12.8369 17.0161 13.0035 17.0566 13.1726 17.0566H16.5866C16.7557 17.0566 16.9223 17.0161 17.0725 16.9384C17.2227 16.8607 17.352 16.7482 17.4497 16.6102C17.5474 16.4722 17.6105 16.3127 17.6339 16.1453C17.6572 15.9778 17.64 15.8072 17.5838 15.6478L15.8768 10.8088C15.804 10.6025 15.669 10.424 15.4905 10.2977C15.3119 10.1713 15.0986 10.1035 14.8799 10.1035C14.6612 10.1035 14.4479 10.1713 14.2693 10.2977C14.0908 10.424 13.9558 10.6025 13.883 10.8088Z" fill="#f3f3f3"/>
        <path d="M9.11959 9.33C9.83204 9.33 10.4096 8.75245 10.4096 8.04C10.4096 7.32755 9.83204 6.75 9.11959 6.75C8.40714 6.75 7.82959 7.32755 7.82959 8.04C7.82959 8.75245 8.40714 9.33 9.11959 9.33Z" fill="#f3f3f3"/>
        <path d="M14.8798 9.33C15.5923 9.33 16.1698 8.75245 16.1698 8.04C16.1698 7.32755 15.5923 6.75 14.8798 6.75C14.1674 6.75 13.5898 7.32755 13.5898 8.04C13.5898 8.75245 14.1674 9.33 14.8798 9.33Z" fill="#f3f3f3"/>
      </g>
      <defs>
        <clipPath id="clip_wc_filter">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}
function FiToilet() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M21.9999 21.4273V10.2623C21.9999 6.01431 20.2779 2.57031 18.1539 2.57031H8.44189C9.93189 4.08131 10.8929 6.89231 10.8929 10.2623V21.4273H21.9999Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M5.846 12.3143C5.28 12.3143 4.821 11.3963 4.821 10.2633C4.821 9.12931 5.28 8.21131 5.846 8.21131C6.412 8.21131 6.872 9.12931 6.872 10.2633C6.872 11.3963 6.412 12.3143 5.846 12.3143ZM5.846 2.57031C3.722 2.57031 2 6.01431 2 10.2633C2 14.5113 3.722 17.9553 5.846 17.9553C7.971 17.9553 9.693 14.5113 9.693 10.2633C9.693 6.01431 7.971 2.57031 5.846 2.57031Z" fill="currentColor"/>
    </svg>
  );
}
function FiPeople() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_people_filter)">
        <path fillRule="evenodd" clipRule="evenodd" d="M7.5 11.6465C7.99246 11.6465 8.48009 11.5495 8.93506 11.361C9.39003 11.1726 9.80343 10.8964 10.1517 10.5481C10.4999 10.1999 10.7761 9.78652 10.9645 9.33155C11.153 8.87658 11.25 8.38894 11.25 7.89648C11.25 7.40403 11.153 6.91639 10.9645 6.46142C10.7761 6.00645 10.4999 5.59305 10.1517 5.24483C9.80343 4.89661 9.39003 4.62039 8.93506 4.43194C8.48009 4.24348 7.99246 4.14648 7.5 4.14648C6.50544 4.14648 5.55161 4.54157 4.84835 5.24483C4.14509 5.9481 3.75 6.90192 3.75 7.89648C3.75 8.89105 4.14509 9.84487 4.84835 10.5481C5.55161 11.2514 6.50544 11.6465 7.5 11.6465ZM8 17.8275C8 16.5635 8.771 14.6925 10.48 13.2755C9.637 12.9785 8.652 12.7925 7.5 12.7925C2.46 12.7925 0.5 16.2305 0.5 17.8275C0.5 19.4275 4.673 19.8515 7.5 19.8515C7.971 19.8515 8.48 19.8385 9.001 19.8115C8.34 19.2845 8 18.6245 8 17.8275Z" fill="currentColor" fillOpacity="0.6"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M16.5 12.7935C11.46 12.7935 9.5 16.2305 9.5 17.8285C9.5 19.4265 13.673 19.8525 16.5 19.8525C19.327 19.8525 23.5 19.4265 23.5 17.8285C23.5 16.2305 21.54 12.7935 16.5 12.7935ZM16.5 11.6465C16.9925 11.6465 17.4801 11.5495 17.9351 11.361C18.39 11.1726 18.8034 10.8964 19.1517 10.5481C19.4999 10.1999 19.7761 9.78652 19.9645 9.33155C20.153 8.87658 20.25 8.38894 20.25 7.89648C20.25 7.40403 20.153 6.91639 19.9645 6.46142C19.7761 6.00645 19.4999 5.59305 19.1517 5.24483C18.8034 4.89661 18.39 4.62039 17.9351 4.43194C17.4801 4.24348 16.9925 4.14648 16.5 4.14648C15.5054 4.14648 14.5516 4.54157 13.8483 5.24483C13.1451 5.9481 12.75 6.90192 12.75 7.89648C12.75 8.89105 13.1451 9.84487 13.8483 10.5481C14.5516 11.2514 15.5054 11.6465 16.5 11.6465Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip_people_filter">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}
function FiDog() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_dog_filter)">
        <path d="M22.0002 10.4697L20.9302 7.99972L20.2002 2.37972C20.1643 2.10241 20.0505 1.84094 19.8721 1.62561C19.6937 1.41028 19.458 1.2499 19.1922 1.16305C18.9264 1.07619 18.6414 1.06641 18.3703 1.13485C18.0991 1.20328 17.853 1.34713 17.6602 1.54972L14.6602 4.72972H9.50021L6.50021 1.54972C6.30747 1.34713 6.06127 1.20328 5.79014 1.13485C5.51901 1.06641 5.23405 1.07619 4.96825 1.16305C4.70244 1.2499 4.46669 1.41028 4.28829 1.62561C4.10988 1.84094 3.99613 2.10241 3.96021 2.37972L3.30021 7.37972L1.92021 10.4697C1.5328 11.2551 1.34721 12.1246 1.38021 12.9997V13.1397V13.6097C1.38021 13.6097 1.38021 13.7697 1.38021 13.8497C1.38021 13.9297 1.44021 14.2197 1.48021 14.4097C1.75758 15.5842 2.31319 16.6749 3.10021 17.5897C4.20086 19.0786 5.63614 20.2878 7.29021 21.1197L7.58021 21.2697L8.01021 21.4597C8.24497 21.566 8.48532 21.6595 8.73021 21.7397L8.89021 21.7897C9.17779 21.8895 9.47179 21.9697 9.77021 22.0297H9.88021C10.1802 22.0897 10.4902 22.1397 10.7902 22.1797H10.9302C11.2788 22.2196 11.6294 22.2397 11.9802 22.2397H12.0802C12.3802 22.2397 12.6902 22.2397 12.9902 22.1897L13.3802 22.1397L13.9902 22.0397L14.4302 21.9297C14.5997 21.8937 14.7667 21.8469 14.9302 21.7897L15.5202 21.5897L15.7702 21.4997C17.7077 20.7169 19.4047 19.4373 20.6902 17.7897L20.8402 17.6497C21.7055 16.6923 22.2753 15.5051 22.4812 14.2311C22.687 12.9572 22.5199 11.6509 22.0002 10.4697ZM9.43021 10.8897C9.23243 10.8897 9.03909 10.8311 8.87464 10.7212C8.71019 10.6113 8.58202 10.4551 8.50633 10.2724C8.43064 10.0897 8.41084 9.88861 8.44942 9.69463C8.48801 9.50065 8.58325 9.32246 8.7231 9.18261C8.86295 9.04276 9.04114 8.94752 9.23512 8.90894C9.4291 8.87035 9.63017 8.89015 9.81289 8.96584C9.99562 9.04153 10.1518 9.1697 10.2617 9.33415C10.3716 9.4986 10.4302 9.69194 10.4302 9.88972C10.4303 10.1515 10.3277 10.4029 10.1444 10.5898C9.96119 10.7768 9.71194 10.8845 9.45021 10.8897H9.43021ZM13.8302 17.6397C13.8302 18.1383 13.6321 18.6165 13.2796 18.9691C12.927 19.3216 12.4488 19.5197 11.9502 19.5197C11.4516 19.5197 10.9734 19.3216 10.6208 18.9691C10.2683 18.6165 10.0702 18.1383 10.0702 17.6397V15.9997H10.1302C10.555 16.0151 10.9722 15.8846 11.3124 15.6299C11.6526 15.3752 11.8954 15.0116 12.0002 14.5997C11.9258 14.5956 11.853 14.5766 11.7861 14.544C11.7191 14.5114 11.6593 14.4657 11.6102 14.4097L10.5102 13.1097C10.4429 13.0306 10.3998 12.9338 10.3861 12.8308C10.3724 12.7279 10.3887 12.6231 10.433 12.5292C10.4773 12.4352 10.5478 12.3561 10.636 12.3012C10.7242 12.2463 10.8263 12.218 10.9302 12.2197H13.1102C13.2124 12.222 13.3119 12.2527 13.3976 12.3083C13.4833 12.364 13.5518 12.4424 13.5954 12.5349C13.639 12.6273 13.656 12.73 13.6445 12.8316C13.633 12.9331 13.5934 13.0294 13.5302 13.1097L12.4402 14.4097C12.3373 14.5235 12.1934 14.5918 12.0402 14.5997C12.1415 14.9908 12.3668 15.3385 12.6823 15.5909C12.9977 15.8433 13.3864 15.9867 13.7902 15.9997H13.8502V17.6697L13.8302 17.6397ZM14.4702 10.8897C14.2724 10.8897 14.0791 10.8311 13.9146 10.7212C13.7502 10.6113 13.622 10.4551 13.5463 10.2724C13.4706 10.0897 13.4508 9.88861 13.4894 9.69463C13.528 9.50065 13.6233 9.32246 13.7631 9.18261C13.903 9.04276 14.0811 8.94752 14.2751 8.90894C14.4691 8.87035 14.6702 8.89015 14.8529 8.96584C15.0356 9.04153 15.1918 9.1697 15.3017 9.33415C15.4116 9.4986 15.4702 9.69194 15.4702 9.88972C15.4703 10.1515 15.3677 10.4029 15.1844 10.5898C15.0012 10.7768 14.7519 10.8845 14.4902 10.8897H14.4702Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip_dog_filter">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}
function FiTimerOff() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_hourglass_filter)">
        <path d="M18.7797 18.212C18.7797 16.4258 17.7597 14.7968 16.1529 14.0168L13.2177 12.5918C12.8913 12.4334 12.7551 12.0404 12.9135 11.714C12.9777 11.5814 13.0851 11.4746 13.2177 11.4098L16.1535 9.98478C17.7603 9.20478 18.7797 7.57518 18.7797 5.78958V2.55078H5.21973V5.78958C5.21973 7.57578 6.23973 9.20478 7.84653 9.98478L10.7823 11.4098C11.1087 11.5682 11.2449 11.9612 11.0865 12.2876C11.0223 12.4202 10.9149 12.527 10.7823 12.5918L7.84593 14.0168C6.23913 14.7968 5.21973 16.4264 5.21973 18.212V21.4508H18.7797V18.212Z" fill="currentColor"/>
        <path d="M18.7804 21.4512H5.21924C4.80524 21.4512 4.46924 21.7872 4.46924 22.2012C4.46924 22.6152 4.80524 22.9512 5.21924 22.9512H18.7804C19.1944 22.9512 19.5304 22.6152 19.5304 22.2012C19.5304 21.7872 19.1944 21.4512 18.7804 21.4512Z" fill="currentColor"/>
        <path d="M18.7804 2.55078C19.1944 2.55078 19.5304 2.21478 19.5304 1.80078C19.5304 1.38678 19.1944 1.05078 18.7804 1.05078H5.21924C4.80524 1.05078 4.46924 1.38678 4.46924 1.80078C4.46924 2.21478 4.80524 2.55078 5.21924 2.55078H18.7804Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="clip_hourglass_filter">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}
function FiParking() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M19.9831 8.95217H4.01709C2.91209 8.95217 2.01709 9.84717 2.01709 10.9522V20.4992C2.01709 21.0512 2.46509 21.4992 3.01709 21.4992H5.46109C6.01309 21.4992 6.46109 21.0512 6.46109 20.4992V19.1352H17.5391V20.4992C17.5391 21.0512 17.9871 21.4992 18.5391 21.4992H20.9831C21.5351 21.4992 21.9831 21.0512 21.9831 20.4992V10.9512C21.9831 9.84617 21.0891 8.95217 19.9831 8.95217ZM18.0191 13.7152H5.98109C5.59209 13.7152 5.20409 13.3262 5.20409 12.9382C5.20409 12.5502 5.49509 12.1612 5.98109 12.1612H18.1161C18.5051 12.1612 18.8931 12.5502 18.8931 12.9382C18.8931 13.3282 18.5051 13.7152 18.0191 13.7152Z" fill="currentColor"/>
      <path d="M18.3112 4.52434C18.0202 3.45634 17.0492 2.77734 15.8842 2.77734H8.11718C7.04918 2.77734 6.07918 3.45634 5.69018 4.52434L4.78418 7.45334H19.2162L18.3102 4.52434H18.3112Z" fill="currentColor"/>
    </svg>
  );
}
function FiCoffee() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.62678 22.087C5.64854 22.3362 5.76288 22.5681 5.94726 22.7372C6.13164 22.9062 6.37266 22.9999 6.62278 23H17.5858C17.8359 22.9999 18.0769 22.9062 18.2613 22.7372C18.4457 22.5681 18.56 22.3362 18.5818 22.087L18.8338 19.193L19.5508 10.969L19.6668 9.631H4.54178L5.62678 22.087ZM20.8038 4.53H19.2068L18.1178 1.666C18.0432 1.47019 17.9109 1.30165 17.7384 1.18271C17.5659 1.06378 17.3613 1.00006 17.1518 1H7.05778C6.62778 1 6.24378 1.265 6.09078 1.666L5.00178 4.53H3.19678C3.06417 4.53 2.93699 4.58268 2.84322 4.67645C2.74946 4.77021 2.69678 4.89739 2.69678 5.03V7.131C2.69678 7.26361 2.74946 7.39079 2.84322 7.48455C2.93699 7.57832 3.06417 7.631 3.19678 7.631H20.8038C20.9364 7.631 21.0636 7.57832 21.1573 7.48455C21.2511 7.39079 21.3038 7.26361 21.3038 7.131V5.03C21.3038 4.89739 21.2511 4.77021 21.1573 4.67645C21.0636 4.58268 20.9364 4.53 20.8038 4.53Z" fill="currentColor"/>
    </svg>
  );
}

// ── 타입 ─────────────────────────────────
export interface FilterState {
  openNow: boolean;
  moods: string[];
  priceMax: number;
  options: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  initialFilters: FilterState;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

// ── 상수 ─────────────────────────────────
export const DEFAULT_FILTERS: FilterState = {
  openNow: true,
  moods: [],
  priceMax: 15000,
  options: [],
};

// 피그마 분위기 칩 목록 (조용한 → 모던한 → 개방적인 → 활기찬 → 아늑한 → 따뜻한 → 자연 → 빈티지)
const MOOD_CHIPS = ['조용한', '모던한', '개방적인', '활기찬', '아늑한', '따뜻한', '자연', '빈티지'];

// 피그마 옵션 칩 목록 (TDS SVG 아이콘 + 텍스트, fs=12)
const OPTION_CHIPS: { icon: ReactNode; label: string }[] = [
  { icon: <FiOutlet />,      label: '콘센트 충분' },
  { icon: <FiSoundOn />,     label: '소음 적당' },
  { icon: <FiSoundOff />,    label: '조용' },
  { icon: <FiPublicToilet />, label: '남/녀 화장실 구분' },
  { icon: <FiToilet />,      label: '내부 화장실' },
  { icon: <FiPeople />,      label: '단체 방문 가능' },
  { icon: <FiDog />,         label: '반려동물 동반 가능' },
  { icon: <FiTimerOff />,    label: '시간제한 없음' },
  { icon: <FiParking />,     label: '주차 가능' },
  { icon: <FiCoffee />,      label: '디카페인 무료 변경' },
];

const PRICE_MIN = 5000;
const PRICE_MAX = 15000;
const PRICE_STEP = 1000;

// ── 칩 버튼 ──────────────────────────────
// 피그마 수치:
//   active  : fill=#000c1e a=0.80 → rgba(0,12,30,0.80), text=#ffffff, r=999, h=32
//   inactive: fill=#07194c a=0.05 → rgba(7,25,76,0.05), stroke=#001733 a=0.02, text=rgba(3,18,40,0.70)
//   mood fs=13 fw=590 / option fs=12 fw=590
function Chip({
  label,
  icon,
  selected,
  onClick,
  fontSize = 13,
}: {
  label: string;
  icon?: ReactNode;
  selected: boolean;
  onClick: () => void;
  fontSize?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: icon ? 4 : 0,
        height: 32,
        padding: icon ? '0 12px' : '0 14px',
        borderRadius: 8,
        border: 'none',
        background: selected ? '#252525' : 'rgba(46,46,46,0.08)',
        color: selected ? '#ffffff' : 'rgba(0,0,0,0.7)',
        fontSize,
        fontWeight: 590,
        flexShrink: 0,
        cursor: 'pointer',
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>{icon}</span>}
      {label}
    </button>
  );
}

// ── 체크박스 ──────────────────────────────
function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onToggle(); }}
      style={{
        width: 20,
        height: 20,
        borderRadius: 5,
        border: checked ? 'none' : '1.5px solid #D1D6DB',
        background: checked ? '#252525' : 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: 'pointer',
      }}
    >
      {checked && (
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path d="M1.5 5L4.5 8L10.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ── 구분선 ──────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: '#F2F4F6', margin: '0 -20px' }} />;
}

// ── FilterModal (메인) ────────────────────
export default function FilterModal({ isOpen, initialFilters, onClose, onApply }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  if (!isOpen) return null;

  const toggleMood = (m: string) => {
    setFilters(f => ({
      ...f,
      moods: f.moods.includes(m) ? f.moods.filter(x => x !== m) : [...f.moods, m],
    }));
  };

  const toggleOption = (o: string) => {
    setFilters(f => ({
      ...f,
      options: f.options.includes(o) ? f.options.filter(x => x !== o) : [...f.options, o],
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  // 슬라이더 트랙 활성화 퍼센트
  const sliderPct = ((filters.priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
      {/* 딤 배경 — 피그마: rgba(0,0,0,0.20) */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.20)' }}
      />

      {/* 시트 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 10,
          right: 10,
          background: '#f3f3f3',
          borderRadius: 28,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'filterSlideUp 0.25s ease',
        }}
      >
        {/* 핸들 — 피그마: 48×4 r=40 fill=#e5e8eb, Handle Area h=20 */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 20 }}>
          <div style={{ width: 48, height: 4, borderRadius: 40, background: '#e5e8eb' }} />
        </div>

        {/* 타이틀 "필터" — 피그마: fs=20 fw=700 fill=#000c1e a=0.80, Title instance h=48 */}
        <div style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'rgba(0,12,30,0.80)', lineHeight: '27px' }}>
            필터
          </h2>
        </div>

        {/* ── 스크롤 가능 콘텐츠 ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>

          {/* 지금 영업중인 카페만 보기
              피그마: fs=14 fw=400 lh=18.9 fill=#777777, Title instance h=39 */}
          <div
            onClick={() => setFilters(f => ({ ...f, openNow: !f.openNow }))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              height: 39,
              cursor: 'pointer',
            }}
          >
            <Checkbox
              checked={filters.openNow}
              onToggle={() => setFilters(f => ({ ...f, openNow: !f.openNow }))}
            />
            <span style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: '#777777', userSelect: 'none' }}>
              지금 영업중인 카페만 보기
            </span>
          </div>

          {/* 분위기 섹션
              피그마: 섹션 타이틀 fs=14 fw=400 lh=18.9 fill=#000c1e a=0.80, Title h=40
              칩 행 각 h=44 (칩 자체 h=32, 상하 여백 6px씩) */}
          <div>
            <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: 'rgba(0,12,30,0.80)' }}>
                분위기
              </h3>
            </div>
            {/* 칩 행 — 피그마: 가로 줄바꿈, 행 높이 44px */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 8 }}>
              {MOOD_CHIPS.map(m => (
                <Chip
                  key={m}
                  label={m}
                  selected={filters.moods.includes(m)}
                  onClick={() => toggleMood(m)}
                  fontSize={13}
                />
              ))}
            </div>
          </div>

          <Divider />

          {/* 가격대 섹션
              피그마: 타이틀 "가격대 (핫아메리카노 1잔 기준)" fs=14 fw=400 fill=#000c1e a=0.80
              슬라이더 트랙: r=2.5 h=5 fill=#e5e8eb / 활성트랙: fill=#252525
              Knob: 26×26 r=9999 fill=#ffffff stroke=#001d3a a=0.18
              값 라벨 (5,000 / 15,000): fs=14 fw=400 fill=#000c1e a=0.80 */}
          <div style={{ padding: '0 0 8px' }}>
            <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: 'rgba(0,12,30,0.80)', margin: 0 }}>
                가격대
              </h3>
              <span style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: 'rgba(0,12,30,0.80)' }}>
                (핫아메리카노 1잔 기준)
              </span>
            </div>

            {/* 현재 선택 가격 — 피그마 슬라이더 툴팁: fs=15 fw=700 fill=#000c1e a=0.80 */}
            <p style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'rgba(0,12,30,0.80)',
              margin: '4px 0 12px',
            }}>
              {filters.priceMax.toLocaleString()}원
            </p>

            {/* 슬라이더 래퍼 — 피그마: 트랙 h=5 r=2.5 fill=#e5e8eb, 활성 fill=#252525 */}
            <div style={{ position: 'relative', margin: '0 0 8px' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 5,
                borderRadius: 2.5,
                background: '#e5e8eb',
                transform: 'translateY(-50%)',
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                width: `${sliderPct}%`,
                height: 5,
                borderRadius: 2.5,
                background: '#252525',
                transform: 'translateY(-50%)',
              }} />
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={filters.priceMax}
                onChange={e => setFilters(f => ({ ...f, priceMax: Number(e.target.value) }))}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 28,
                  appearance: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  zIndex: 1,
                }}
              />
            </div>

            {/* 최솟값 ~ 최댓값 레이블 — 피그마: fs=14 fw=400 fill=#000c1e a=0.80 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 14,
              fontWeight: 400,
              color: 'rgba(0,12,30,0.80)',
              lineHeight: '18.9px',
            }}>
              <span>5,000</span>
              <span>15,000</span>
            </div>
          </div>

          <Divider />

          {/* 옵션 섹션
              피그마: 타이틀 fs=14 fw=400 fill=#000c1e a=0.80
              옵션 칩 fs=12 fw=590 (분위기 칩보다 작음) */}
          <div style={{ paddingBottom: 12 }}>
            <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: 'rgba(0,12,30,0.80)' }}>
                옵션
              </h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {OPTION_CHIPS.map(({ icon, label }) => (
                <Chip
                  key={label}
                  icon={icon}
                  label={label}
                  selected={filters.options.includes(label)}
                  onClick={() => toggleOption(label)}
                  fontSize={12}
                />
              ))}
            </div>
          </div>

          <div style={{ height: 16 }} />
        </div>

        {/* ── 하단 고정: 초기화 + 적용하기 버튼 ── */}
        <div
          style={{
            height: 90,
            padding: '34px 20px 0',
            background: '#f3f3f3',
            display: 'flex',
            gap: 10,
          }}
        >
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            style={{
              width: 88,
              height: 56,
              borderRadius: 16,
              background: 'rgba(0,12,30,0.05)',
              color: 'rgba(0,12,30,0.6)',
              fontSize: 17,
              fontWeight: 590,
              cursor: 'pointer',
              border: 'none',
              flexShrink: 0,
            }}
          >
            초기화
          </button>
          <button
            onClick={handleApply}
            style={{
              flex: 1,
              height: 56,
              borderRadius: 16,
              background: '#252525',
              color: '#ffffff',
              fontSize: 17,
              fontWeight: 590,
              cursor: 'pointer',
              border: 'none',
            }}
          >
            적용하기
          </button>
        </div>
      </div>

      <style>{`
        @keyframes filterSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        /* 슬라이더 Knob — 피그마: 26×26 r=9999 fill=#ffffff stroke=#001d3a a=0.18 */
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 26px;
          height: 26px;
          border-radius: 9999px;
          background: #ffffff;
          border: 1px solid rgba(0,29,58,0.18);
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 26px;
          height: 26px;
          border-radius: 9999px;
          background: #ffffff;
          border: 1px solid rgba(0,29,58,0.18);
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

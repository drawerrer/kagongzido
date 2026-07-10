/// <reference types="@rsbuild/core/types" />

declare module '*.svg?react' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

interface ImportMetaEnv {
  readonly VITE_KAKAO_MAP_KEY?: string;
  readonly VITE_KAKAO_REST_KEY?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Kakao Maps SDK 전역 타입은 src/kakao.d.ts 에서 선언한다.

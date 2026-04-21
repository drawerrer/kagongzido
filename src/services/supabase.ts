// Supabase 클라이언트 (환경변수 미설정 시 null)
// 실제 연동 시 @supabase/supabase-js를 별도 설정 후 아래 주석 해제

// import { createClient } from '@supabase/supabase-js';
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
// export const supabase = supabaseUrl && supabaseAnonKey
//   ? createClient(supabaseUrl, supabaseAnonKey)
//   : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = null;

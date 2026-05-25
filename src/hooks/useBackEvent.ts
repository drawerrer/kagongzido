import { useEffect } from 'react';
import { graniteEvent } from '@apps-in-toss/web-framework';

/**
 * 토스 미니앱 공통 백 이벤트 등록 훅.
 *
 * 시스템 백버튼, 토스 내비게이션 백버튼, 엣지 스와이프 모두 동일하게 처리됨.
 *
 * @param handler  백 이벤트 발생 시 실행할 콜백. 일반 모드에서도 반드시
 *                 명시적 동작(닫기/홈 이동/앱 종료 위임)을 호출해야 함.
 *                 핸들러가 아무것도 안 하면 SDK 기본 동작이 무시되어
 *                 백버튼이 먹통이 됨 (CollectionPage 회귀 사례).
 * @param enabled  false 면 리스너 등록 자체를 건너뜀.
 *                 (오버레이 열려 있어 다른 리스너에 위임할 때 사용)
 *                 기본값 true.
 *
 * @example
 *   useBackEvent(() => {
 *     if (isEditMode) { exitEditMode(); return; }
 *     onBack?.();
 *   }, !hasOverlay);
 *
 * @example  토스 환경 밖(웹 브라우저)에서는 graniteEvent.addEventListener 가
 *           예외를 던지지만 본 훅 내부에서 try/catch 로 안전하게 무시함.
 */
export function useBackEvent(handler: () => void, enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;
    try {
      const unsubscribe = graniteEvent.addEventListener('backEvent', {
        onEvent: handler,
        onError: (err) => console.error('[useBackEvent]', err),
      });
      return unsubscribe;
    } catch {
      // 토스 외 환경(개발 서버 직접 접속 등)에서는 SDK 가 동작하지 않음 → 무시
      return undefined;
    }
  }, [handler, enabled]);
}

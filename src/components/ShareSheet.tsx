import { useState } from 'react';
import BottomSheet from './BottomSheet';

const SFPro = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** 공유 대상 이름 (카페명, 컬렉션명 등) */
  shareTitle?: string;
  /** 공유할 URL — 기본값: window.location.href */
  shareUrl?: string;
}

// ─── 공유 앱 목록 ──────────────────────────────────────────────
const SHARE_APPS = [
  {
    id: 'copy',
    label: '링크 복사',
    bgColor: '#F2F4F6',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="9" y="9" width="11" height="11" rx="2" stroke="#191F28" strokeWidth="1.8"/>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="#191F28" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'kakaotalk',
    label: '카카오톡',
    bgColor: '#FEE500',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C7.03 3 3 6.36 3 10.5c0 2.64 1.68 4.97 4.22 6.35l-.93 3.42 3.93-2.58c.56.08 1.16.12 1.78.12 4.97 0 9-3.36 9-7.5S16.97 3 12 3z" fill="#3C1E1E"/>
      </svg>
    ),
  },
  {
    id: 'instagram',
    label: '인스타그램',
    bgColor: 'transparent',
    gradientBg: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    id: 'x',
    label: 'X',
    bgColor: '#000000',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    id: 'more',
    label: '더보기',
    bgColor: '#F2F4F6',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="5" cy="12" r="2" fill="#6B7684"/>
        <circle cx="12" cy="12" r="2" fill="#6B7684"/>
        <circle cx="19" cy="12" r="2" fill="#6B7684"/>
      </svg>
    ),
  },
];

export default function ShareSheet({ isOpen, onClose, shareTitle = '카공지도', shareUrl }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  const url = shareUrl ?? window.location.href;

  const handleApp = async (appId: string) => {
    switch (appId) {
      case 'copy': {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* fallback */
          const el = document.createElement('input');
          el.value = url;
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
        break;
      }
      case 'kakaotalk': {
        // 카카오링크 웹 공유
        const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(url)}`;
        window.open(kakaoUrl, '_blank');
        onClose();
        break;
      }
      case 'instagram': {
        // 링크 복사 후 인스타 실행 (인스타는 URL 직접 공유 미지원)
        try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
        window.open('instagram://', '_blank');
        onClose();
        break;
      }
      case 'x': {
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(url)}`;
        window.open(tweetUrl, '_blank');
        onClose();
        break;
      }
      case 'more': {
        try {
          if (navigator.share) {
            await navigator.share({ title: shareTitle, url });
          } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        } catch { /* ignore */ }
        onClose();
        break;
      }
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div style={{ padding: '0 20px 28px' }}>

        {/* 타이틀 */}
        <p style={{
          fontFamily: SFPro, fontWeight: 700, fontSize: 18,
          color: '#191F28', textAlign: 'center',
          marginBottom: 20, marginTop: 4,
        }}>
          공유하기
        </p>

        {/* 앱 아이콘 가로 목록 */}
        <div style={{
          display: 'flex', gap: 16,
          overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none',
          justifyContent: 'center',
        }}>
          {SHARE_APPS.map(app => (
            <button
              key={app.id}
              onClick={() => handleApp(app.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
                padding: 0,
              }}
            >
              {/* 아이콘 원 */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: app.gradientBg ?? app.bgColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'opacity 0.15s',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* 복사 완료 오버레이 */}
                {app.id === 'copy' && copied && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    backgroundColor: '#00C471',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path d="M5 11l4.5 4.5L17 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                {app.icon}
              </div>
              {/* 라벨 */}
              <span style={{
                fontFamily: SFPro, fontWeight: 510, fontSize: 12,
                color: app.id === 'copy' && copied ? '#00C471' : '#6B7684',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s',
              }}>
                {app.id === 'copy' && copied ? '복사됐어요!' : app.label}
              </span>
            </button>
          ))}
        </div>

        {/* 링크 미리보기 + 복사 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginTop: 20,
          backgroundColor: '#F9FAFB',
          borderRadius: 12, padding: '10px 14px',
          border: '1px solid #E5E8EB',
        }}>
          {/* URL 텍스트 */}
          <span style={{
            fontFamily: SFPro, fontWeight: 400, fontSize: 13,
            color: '#6B7684', flex: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {url}
          </span>
          {/* 복사 버튼 */}
          <button
            onClick={() => handleApp('copy')}
            style={{
              flexShrink: 0, height: 32, padding: '0 12px',
              borderRadius: 8,
              backgroundColor: copied ? '#00C471' : '#3182F6',
              border: 'none', cursor: 'pointer',
              fontFamily: SFPro, fontWeight: 590, fontSize: 13,
              color: '#ffffff',
              transition: 'background-color 0.2s',
            }}
          >
            {copied ? '복사됨' : '복사'}
          </button>
        </div>

        {/* 취소 버튼 */}
        <button
          onClick={onClose}
          style={{
            width: '100%', height: 52, marginTop: 12,
            borderRadius: 14, backgroundColor: 'rgba(7,25,76,0.05)',
            border: 'none', cursor: 'pointer',
            fontFamily: SFPro, fontWeight: 590, fontSize: 17,
            color: 'rgba(3,18,40,0.7)',
          }}
        >
          취소
        </button>
      </div>
    </BottomSheet>
  );
}

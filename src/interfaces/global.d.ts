// global.d.ts หรือที่ไฟล์ .ts ใดก็ได้ที่ถูกโหลดก่อนใช้
export {};

declare global {
  interface Window {
    turnstile?: {
      reset?: () => void;
    };
    __TURNSTILE_TOKEN__?: string;
  }
}

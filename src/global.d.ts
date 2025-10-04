
declare global {
  interface Window {
    // Turnstile API
    turnstile?: {
      render?: (
        el: HTMLElement | string,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          appearance?: "always" | "execute" | "interaction-only";
          "refresh-expired"?: "auto" | "manual";
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset?: (id?: string) => void;
      remove?: (id: string) => void;
      getResponse?: (id?: string) => string | undefined;
    };
  }
}

export {};
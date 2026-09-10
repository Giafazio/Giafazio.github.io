export {};

type FabrizioWebhomeInitOnAstroLoad = (options: {
  selector: string;
  initializedAttribute?: string;
  initializer: (root: HTMLElement) => void;
  onPageLoad?: () => void;
  onBeforeSwap?: () => void;
}) => void;

declare global {
  interface Window {
    fabrizioWebhome?: {
      initOnAstroLoad: FabrizioWebhomeInitOnAstroLoad;
    };
  }
}

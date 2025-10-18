/// <reference types="next" />
/// <reference types="next/types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: string;
  }
}

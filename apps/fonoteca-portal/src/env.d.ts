/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_BACKEND_API_URL?: string;
  readonly BACKEND_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.png" {
  const content: any;
  export default content;
}

declare module "*.webp" {
  const content: any;
  export default content;
}

declare module "*.jpg" {
  const content: any;
  export default content;
}

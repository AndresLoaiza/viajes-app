/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Token fine-grained con permiso "Gists" (read/write). Destino de los envíos. */
  readonly VITE_GIST_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

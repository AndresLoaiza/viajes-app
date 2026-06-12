/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Token fine-grained con permiso "Gists" (read/write). Destino de los envíos. */
  readonly VITE_GIST_TOKEN?: string;
  /** Supabase: URL del proyecto y publishable/anon key (seguras de exponer en cliente). */
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** SHA-256 hex del código de acceso (nunca el código en texto plano). */
  readonly VITE_ACCESS_CODE_HASH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

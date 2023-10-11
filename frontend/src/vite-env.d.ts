/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TITLE: string;
    readonly VITE_BACKEND_BASE_URL: string;
    readonly VITE_BACKEND_BASE_SOCKET_URL: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
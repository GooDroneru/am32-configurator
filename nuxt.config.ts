export default defineNuxtConfig({
    devtools: {
        enabled: true,
        timeline: { enabled: true }
    },

    typescript: {
        shim: false,
        typeCheck: true
    },

    app: {
        baseURL: '/configurator/',
    },

    ssr: false,

    runtimeConfig: {
        redis: {
            host: process.env.REDIS_HOST,
            port: 6379
        }
    },

    modules: [
        '@vite-pwa/nuxt',
        'nuxt-svgo',
        'dayjs-nuxt',
        '@nuxt/ui',
        '@pinia/nuxt',
        '@vueuse/nuxt',
        ['@nuxtjs/google-fonts', {
            families: { Roboto: true, 'Nunito Sans': true }
        }],
        '@nuxt/content',
        '@nuxt/image'
    ],

    pinia: { storesDirs: ['./stores/**'] },
    colorMode: { preference: 'dark' },
    svgo: { autoImportPath: false, explicitImportsOnly: true },

    pwa: {
        registerType: 'autoUpdate',
        manifest: {
            id: '/configurator/',        // ← было '/'
            start_url: '/configurator/', // ← добавлено
            scope: '/configurator/',     // ← добавлено
            name: 'AM32 configurator',
            short_name: 'AM32CONF',
            theme_color: '#000000',
            description: 'Configurator for the ESC firmware AM32',
            icons: [
                { src: 'assets/images/am32-logo.png', sizes: '848x848', type: 'image/png' },
                { src: 'assets/images/192x192.png', sizes: '192x192', type: 'image/png' },
                { src: 'assets/images/144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
                { src: 'assets/images/96x96.png', sizes: '96x96', type: 'image/png', purpose: 'any' }
            ],
            screenshots: [
                { src: 'assets/images/screenshot1.png', sizes: '1742x918', type: 'image/png', form_factor: 'wide', label: '4in1 ESC' },
                { src: 'assets/images/screenshot1.png', sizes: '1742x918', type: 'image/png', form_factor: 'narrow', label: '4in1 ESC' }
            ]
        },
        workbox: {
            navigateFallback: '/configurator/',               // ← было '/'
            navigateFallbackAllowlist: [/^\/configurator\//], // ← исправлено
            globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        },
        client: {
            installPrompt: true,
            periodicSyncForUpdates: 3600
        },
        devOptions: {
            enabled: true,
            suppressWarnings: true,
            navigateFallbackAllowlist: [/^\/configurator\//], // ← исправлено
            type: 'module'
        }
    },

    compatibilityDate: '2024-09-16'
})
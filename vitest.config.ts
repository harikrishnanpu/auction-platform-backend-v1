import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        alias: {
            '@domain': path.resolve(__dirname, './src/domain'),
            '@application': path.resolve(__dirname, './src/application'),
            '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
            '@presentation': path.resolve(__dirname, './src/presentation'),
            '@config': path.resolve(__dirname, './src/config'),
            '@di': path.resolve(__dirname, './src/di'),
        },
    },
});

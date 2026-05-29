import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        alias: {
            '@domain': path.resolve(__dirname, './src/domain'),
        },
    },
});

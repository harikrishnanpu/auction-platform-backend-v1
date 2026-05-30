import { describe, expect, it } from 'vitest';
import {
    SystemConfig,
    SystemConfigKey,
    SystemConfigValueType,
} from '@domain/entities/system-config/system-config.entity';

describe('SystemConfig Domain Entity', () => {
    it('should successfully create a valid SystemConfig entity', () => {
        const configResult = SystemConfig.create({
            id: 'cfg-1',
            key: SystemConfigKey.FRAUD_SUSPENSION_THRESHOLD,
            valueType: SystemConfigValueType.NUMBER,
            value: '5',
            description: 'fraud score threshold to suspend a user',
        });

        expect(configResult.isSuccess).toBe(true);
        expect(configResult.getValue().getId()).toBe('cfg-1');
        expect(configResult.getValue().getKey()).toBe(
            SystemConfigKey.FRAUD_SUSPENSION_THRESHOLD,
        );
        expect(configResult.getValue().getValueType()).toBe(
            SystemConfigValueType.NUMBER,
        );
        expect(configResult.getValue().getValue()).toBe('5');
        expect(configResult.getValue().getDescription()).toBe(
            'fraud score threshold to suspend a user',
        );
    });
});

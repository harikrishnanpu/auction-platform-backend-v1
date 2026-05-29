import { describe, expect, it } from 'vitest';
import { Phone } from '@domain/value-objects/phone.vo';

describe('Phone Value Object', () => {
    it('should successfully create a Phone value object for valid 10-digit number', () => {
        const phoneResult = Phone.create('9876543210');
        expect(phoneResult.isSuccess).toBe(true);
        expect(phoneResult.isFailure).toBe(false);
        expect(phoneResult.getValue().getValue()).toBe('9876543210');
    });

    it('should fail to create Phone for number starting with less than 6', () => {
        const phoneResult = Phone.create('5876543210');
        expect(phoneResult.isSuccess).toBe(false);
        expect(phoneResult.isFailure).toBe(true);
        expect(phoneResult.getError()).toBe('Invalid phone number format');
    });

    it('should fail to create Phone for less than 10 digits', () => {
        const phoneResult = Phone.create('987654321');
        expect(phoneResult.isSuccess).toBe(false);
        expect(phoneResult.isFailure).toBe(true);
        expect(phoneResult.getError()).toBe('Invalid phone number format');
    });

    it('should fail to create Phone for non-numeric digits', () => {
        const phoneResult = Phone.create('987654321a');
        expect(phoneResult.isSuccess).toBe(false);
        expect(phoneResult.isFailure).toBe(true);
        expect(phoneResult.getError()).toBe('Invalid phone number format');
    });
});

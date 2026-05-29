import { describe, expect, it } from 'vitest';
import { Email } from '@domain/value-objects/email.vo';

describe('Email Value Object', () => {
    it('should successfully create an Email value object for valid email', () => {
        const emailResult = Email.create('john.doe@example.com');
        expect(emailResult.isSuccess).toBe(true);
        expect(emailResult.isFailure).toBe(false);
        expect(emailResult.getValue().getValue()).toBe('john.doe@example.com');
    });

    it('should normalize valid emails to lowercase', () => {
        const emailResult = Email.create('JOHN.DOE@EXAMPLE.COM');
        expect(emailResult.isSuccess).toBe(true);
        expect(emailResult.getValue().getValue()).toBe('john.doe@example.com');
    });

    it('should fail to create Email for invalid email format', () => {
        const emailResult = Email.create('invalid-email-format');
        expect(emailResult.isSuccess).toBe(false);
        expect(emailResult.isFailure).toBe(true);
        expect(emailResult.getError()).toBe('Invalid email format');
    });
});

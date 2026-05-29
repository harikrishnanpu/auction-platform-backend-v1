import { describe, expect, it } from 'vitest';
import { SubscriptionPlan } from '@domain/entities/subscription/subscription-plan.entity';

describe('SubscriptionPlan Domain Entity', () => {
    it('should successfully create a valid SubscriptionPlan entity', () => {
        const planResult = SubscriptionPlan.create({
            id: 'plan-1',
            name: 'Premium',
            description: 'Gold level access',
            price: 999,
            durationDays: 30,
            isDefault: false,
            isActive: true,
            features: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        expect(planResult.isSuccess).toBe(true);
        expect(planResult.getValue().getName()).toBe('Premium');
        expect(planResult.getValue().getPrice()).toBe(999);
        expect(planResult.getValue().getDurationDays()).toBe(30);
    });

    it('should support updating plan name and description', () => {
        const plan = SubscriptionPlan.create({
            id: 'plan-1',
            name: 'Premium',
            description: 'Gold level access',
            price: 999,
            durationDays: 30,
            isDefault: false,
            isActive: true,
            features: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        }).getValue();

        const updateResult = plan.update('Ultra Premium', 'Platinum access');
        expect(updateResult.isSuccess).toBe(true);
        expect(plan.getName()).toBe('Ultra Premium');
        expect(plan.getDescription()).toBe('Platinum access');
    });

    it('should support updating status', () => {
        const plan = SubscriptionPlan.create({
            id: 'plan-1',
            name: 'Premium',
            description: 'Gold level access',
            price: 999,
            durationDays: 30,
            isDefault: false,
            isActive: true,
            features: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        }).getValue();

        const updateResult = plan.updateStatus(true, false);
        expect(updateResult.isSuccess).toBe(true);
        expect(plan.getIsDefault()).toBe(true);
        expect(plan.getIsActive()).toBe(false);
    });

    it('should support updating duration days', () => {
        const plan = SubscriptionPlan.create({
            id: 'plan-1',
            name: 'Premium',
            description: 'Gold level access',
            price: 999,
            durationDays: 30,
            isDefault: false,
            isActive: true,
            features: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        }).getValue();

        const updateResult = plan.updateDurationDays(90);
        expect(updateResult.isSuccess).toBe(true);
        expect(plan.getDurationDays()).toBe(90);
    });
});

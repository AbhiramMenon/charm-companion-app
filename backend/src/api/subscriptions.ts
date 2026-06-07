// ============================================================
// Subscriptions API
// ============================================================

import type { KrackitClient } from '../client';
import { assertOk } from '../client';
import type { Subscription, BillCycle, PlanType } from '../types';

export function subscriptionApi(sb: KrackitClient) {
  return {
    async listForUser(userId: string): Promise<Subscription[]> {
      const { data, error } = await sb
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return assertOk(data, error);
    },

    async getActiveForUser(userId: string): Promise<Subscription[]> {
      const { data, error } = await sb
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString());
      return assertOk(data, error);
    },

    async getSubscribedExamIds(userId: string): Promise<string[]> {
      const { data, error } = await sb
        .rpc('get_user_subscribed_exams', { p_user_id: userId });
      return assertOk(data, error).map(r => r.exam_id);
    },

    async create(payload: {
      userId: string;
      examId?: string;
      planType: PlanType;
      billingCycle: BillCycle;
      amountPaise: number;
      transactionId?: string;
    }): Promise<Subscription> {
      const monthsMap: Record<BillCycle, number> = { monthly: 1, sixmonths: 6, yearly: 12 };
      const months = monthsMap[payload.billingCycle];
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      const { data, error } = await sb
        .from('subscriptions')
        .insert({
          user_id:        payload.userId,
          exam_id:        payload.examId ?? null,
          plan_type:      payload.planType,
          billing_cycle:  payload.billingCycle,
          amount_paise:   payload.amountPaise,
          status:         'active',
          expires_at:     expiresAt.toISOString(),
          transaction_id: payload.transactionId ?? null,
        })
        .select()
        .single();
      return assertOk(data, error);
    },

    async cancel(subscriptionId: string): Promise<Subscription> {
      const { data, error } = await sb
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId)
        .select()
        .single();
      return assertOk(data, error);
    },

    async expireStale(): Promise<number> {
      const { data, error } = await sb.rpc('expire_stale_subscriptions');
      return assertOk(data, error) as unknown as number;
    },

    // Admin: list all subscriptions with optional filters
    async listAll(filters?: { status?: string; examId?: string }): Promise<Subscription[]> {
      let q = sb.from('subscriptions').select('*').order('created_at', { ascending: false });
      if (filters?.status) q = q.eq('status', filters.status);
      if (filters?.examId) q = q.eq('exam_id', filters.examId);
      const { data, error } = await q;
      return assertOk(data, error);
    },

    // Revenue summary per exam — uses the DB view
    async revenueByExam() {
      const { data, error } = await sb.from('v_revenue_by_exam' as any).select('*');
      return assertOk(data, error);
    },
  };
}

// ============================================================
// Pricing API
// ============================================================

import type { KrackitClient } from '../client';
import { assertOk } from '../client';
import type { ExamPricing, BillCycle } from '../types';

export function pricingApi(sb: KrackitClient) {
  return {
    // Get all exam pricing (publicly readable)
    async listAll(): Promise<ExamPricing[]> {
      const { data, error } = await sb
        .from('exam_pricing')
        .select('*');
      return assertOk(data, error);
    },

    // Get pricing for a specific exam
    async get(examId: string): Promise<ExamPricing | null> {
      const { data } = await sb
        .from('exam_pricing')
        .select('*')
        .eq('exam_id', examId)
        .maybeSingle();
      return data;
    },

    // Get price for a specific exam + billing cycle (with fallback)
    async getPrice(examId: string, cycle: BillCycle): Promise<number> {
      const defaults: Record<BillCycle, number> = { monthly: 149, sixmonths: 749, yearly: 1299 };
      const pricing = await pricingApi(sb).get(examId);
      if (!pricing) return defaults[cycle];
      return pricing[cycle];
    },

    // Admin: upsert pricing for an exam
    async upsert(examId: string, monthly: number, sixmonths: number, yearly: number): Promise<ExamPricing> {
      const { data, error } = await sb
        .from('exam_pricing')
        .upsert({ exam_id: examId, monthly, sixmonths, yearly }, { onConflict: 'exam_id' })
        .select()
        .single();
      return assertOk(data, error);
    },

    // Admin: bulk upsert
    async upsertMany(records: Omit<ExamPricing, 'updated_at'>[]): Promise<ExamPricing[]> {
      const { data, error } = await sb
        .from('exam_pricing')
        .upsert(records, { onConflict: 'exam_id' })
        .select();
      return assertOk(data, error);
    },
  };
}

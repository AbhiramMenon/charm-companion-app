// ============================================================
// Support Issues API
// ============================================================

import type { KrackitClient } from '../client';
import { assertOk } from '../client';
import type { SupportIssue, CreateSupportIssue, UpdateSupportIssue, IssueStatus, IssuePriority } from '../types';

export function issueApi(sb: KrackitClient) {
  return {
    // Mobile: submit a new issue
    async create(payload: CreateSupportIssue): Promise<SupportIssue> {
      const { data, error } = await sb
        .from('support_issues')
        .insert(payload)
        .select()
        .single();
      return assertOk(data, error);
    },

    // Mobile: get user's own issues
    async listForUser(userId: string): Promise<SupportIssue[]> {
      const { data, error } = await sb
        .from('support_issues')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return assertOk(data, error);
    },

    // Admin: list all issues with filters
    async listAll(filters?: {
      status?: IssueStatus | 'all';
      priority?: IssuePriority | 'all';
    }): Promise<SupportIssue[]> {
      let q = sb.from('support_issues').select('*').order('created_at', { ascending: false });
      if (filters?.status && filters.status !== 'all') q = q.eq('status', filters.status);
      if (filters?.priority && filters.priority !== 'all') q = q.eq('priority', filters.priority);
      const { data, error } = await q;
      return assertOk(data, error);
    },

    // Admin: update issue status/priority/note
    async update(id: string, payload: UpdateSupportIssue): Promise<SupportIssue> {
      const updates: Record<string, unknown> = { ...payload };
      if (payload.status === 'resolved' && !payload.resolved_at) {
        updates.resolved_at = new Date().toISOString();
      }
      const { data, error } = await sb
        .from('support_issues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return assertOk(data, error);
    },

    // Admin: delete issue
    async delete(id: string): Promise<void> {
      const { error } = await sb.from('support_issues').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },

    // Admin: quick status transitions
    async markInProgress(id: string): Promise<SupportIssue> {
      return issueApi(sb).update(id, { status: 'in_progress' });
    },

    async markResolved(id: string, note?: string): Promise<SupportIssue> {
      return issueApi(sb).update(id, {
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        ...(note ? { admin_note: note } : {}),
      });
    },
  };
}

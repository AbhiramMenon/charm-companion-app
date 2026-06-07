// ============================================================
// Notifications API
// ============================================================

import type { KrackitClient } from '../client';
import { assertOk } from '../client';
import type { PushNotification, NotificationDelivery, CreatePushNotification } from '../types';

export function notificationApi(sb: KrackitClient) {
  return {
    // Admin: list all notifications
    async listAll(): Promise<PushNotification[]> {
      const { data, error } = await sb
        .from('push_notifications')
        .select('*')
        .order('scheduled_at', { ascending: false });
      return assertOk(data, error);
    },

    // Admin: create notification
    async create(payload: CreatePushNotification): Promise<PushNotification> {
      const { data, error } = await sb
        .from('push_notifications')
        .insert(payload)
        .select()
        .single();
      return assertOk(data, error);
    },

    // Admin: update notification
    async update(id: string, payload: Partial<CreatePushNotification>): Promise<PushNotification> {
      const { data, error } = await sb
        .from('push_notifications')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      return assertOk(data, error);
    },

    // Admin: delete notification
    async delete(id: string): Promise<void> {
      const { error } = await sb.from('push_notifications').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },

    // Admin: mark as sent (called after actual push delivery)
    async markSent(id: string, recipientCount: number): Promise<PushNotification> {
      const { data, error } = await sb
        .from('push_notifications')
        .update({ status: 'sent', sent_at: new Date().toISOString(), recipient_count: recipientCount })
        .eq('id', id)
        .select()
        .single();
      return assertOk(data, error);
    },

    // Mobile: get sent notifications for user's feed
    async listSentForFeed(limit = 30): Promise<PushNotification[]> {
      const { data, error } = await sb
        .from('push_notifications')
        .select('*')
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(limit);
      return assertOk(data, error);
    },

    // Mobile: get user's unread notification count
    async getUnreadCount(userId: string): Promise<number> {
      const { count, error } = await sb
        .from('notification_deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('read_at', null);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },

    // Mobile: mark notification as read
    async markRead(notificationId: string, userId: string): Promise<void> {
      const { error } = await sb
        .from('notification_deliveries')
        .update({ read_at: new Date().toISOString() })
        .eq('notification_id', notificationId)
        .eq('user_id', userId);
      if (error) throw new Error(error.message);
    },

    // Subscribe to real-time new notifications (mobile)
    subscribeToNew(callback: (notification: PushNotification) => void) {
      return sb
        .channel('push_notifications:sent')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'push_notifications',
          filter: 'status=eq.sent',
        }, (payload) => callback(payload.new as PushNotification))
        .subscribe();
    },
  };
}

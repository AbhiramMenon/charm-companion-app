// ============================================================
// KrackIT API — Barrel Export
// Usage:
//   import { createKrackitApi } from '@krackit/api';
//   const api = createKrackitApi(supabaseClient);
//   const exams = await api.exams.list();
// ============================================================

export * from '../types';
export * from '../client';

export { examApi }        from './content';
export { subjectApi }     from './content';
export { chapterApi }     from './content';
export { topicApi }       from './content';
export { trickApi }       from './content';
export { shortNoteApi }   from './content';
export { examNewsApi }    from './content';
export { loadAllContent } from './content';
export { authApi }        from './users';
export { userProfileApi } from './users';
export { userProgressApi }from './users';
export { bookmarkApi }    from './users';
export { subscriptionApi }from './subscriptions';
export { ratingApi }      from './ratings';
export { issueApi }       from './issues';
export { notificationApi }from './notifications';
export { pricingApi }     from './pricing';
export { aboutApi }       from './about';
export { trickOfDayApi }  from './trickofday';
export { analyticsApi }   from './analytics';

import type { KrackitClient } from '../client';
import { examApi, subjectApi, chapterApi, topicApi, trickApi, shortNoteApi, examNewsApi, loadAllContent } from './content';
import { authApi, userProfileApi, userProgressApi, bookmarkApi } from './users';
import { subscriptionApi } from './subscriptions';
import { ratingApi }       from './ratings';
import { issueApi }        from './issues';
import { notificationApi } from './notifications';
import { pricingApi }      from './pricing';
import { aboutApi }        from './about';
import { trickOfDayApi }   from './trickofday';
import { analyticsApi }    from './analytics';

/**
 * Creates a fully-typed API object for the given Supabase client.
 * Pass an admin client for full write access, or a mobile client for RLS-scoped access.
 */
export function createKrackitApi(sb: KrackitClient) {
  return {
    // Auth
    auth:          authApi(sb),

    // Content hierarchy
    exams:         examApi(sb),
    subjects:      subjectApi(sb),
    chapters:      chapterApi(sb),
    topics:        topicApi(sb),
    tricks:        trickApi(sb),
    notes:         shortNoteApi(sb),
    news:          examNewsApi(sb),

    // Utility
    loadAllContent: () => loadAllContent(sb),

    // Users
    profiles:      userProfileApi(sb),
    progress:      userProgressApi(sb),
    bookmarks:     bookmarkApi(sb),

    // Subscriptions & billing
    subscriptions: subscriptionApi(sb),
    pricing:       pricingApi(sb),

    // Engagement
    ratings:       ratingApi(sb),
    issues:        issueApi(sb),
    notifications: notificationApi(sb),

    // App management
    trickOfDay:    trickOfDayApi(sb),
    about:         aboutApi(sb),

    // Analytics (admin only — will 403 for regular users)
    analytics:     analyticsApi(sb),
  };
}

export type KrackitApi = ReturnType<typeof createKrackitApi>;

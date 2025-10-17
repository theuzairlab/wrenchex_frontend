import { apiClient } from '@/lib/api/client';
import { toast } from 'react-hot-toast';

// Simple notifier that prefers toast and falls back to alert
function notify(message: string, type: 'error' | 'success' | 'info' = 'error') {
  try {
    if (type === 'success') {
      toast.success(message);
      return;
    }
    if (type === 'info') {
      toast(message);
      return;
    }
    toast.error(message);
  } catch (_) {
    // Fallback for environments without toast
    // eslint-disable-next-line no-alert
    alert(message);
  }
}

export interface AuthLike {
  token: string | null;
  user: { id: string } | null;
}

export interface GuardMessages {
  notLoggedIn?: string;
  notAllowed?: string;
  genericError?: string;
}

const defaultMessages: Required<GuardMessages> = {
  notLoggedIn: 'Please log in to continue',
  notAllowed: 'You are not allowed to perform this action',
  genericError: 'Something went wrong. Please try again later',
};

// Generic guard helper to reuse across actions
export async function guardWithPredicate(
  isAllowedPredicate: () => Promise<boolean>,
  auth: AuthLike,
  messages?: GuardMessages
): Promise<boolean> {
  const msgs = { ...defaultMessages, ...(messages || {}) };

  if (!auth?.token || !auth?.user) {
    notify(msgs.notLoggedIn, 'error');
    return false;
  }

  try {
    const allowed = await isAllowedPredicate();
    if (!allowed) {
      notify(msgs.notAllowed, 'error');
      return false;
    }
    return true;
  } catch {
    notify(msgs.genericError, 'error');
    return false;
  }
}

// Specific guard: can the current user contact the seller?
export async function guardContactSeller(
  sellerId: string,
  auth: AuthLike,
  messages?: GuardMessages
): Promise<boolean> {
  return guardWithPredicate(
    async () => {
      const res = await apiClient.canContactSeller(sellerId);
      return !!(res.success && res.data && res.data.canContact);
    },
    auth,
    {
      notLoggedIn: 'Please log in to contact the shop',
      notAllowed: 'You can only contact shops you have interacted with before (chatted about products or booked services)',
      ...messages,
    }
  );
}

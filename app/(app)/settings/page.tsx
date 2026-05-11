import { redirect } from 'next/navigation';

/**
 * `/settings` is an alias for `/profile`, per the handoff routes table,
 * profile and settings live on the same screen. We do a server-side
 * redirect rather than re-rendering the same component so deep-linking
 * always normalizes onto `/profile`.
 */
export default function SettingsAliasPage() {
  redirect('/profile');
}

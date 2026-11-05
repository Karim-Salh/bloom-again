<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All UI text lives in `src/lib/i18n.tsx` (en + ar); pages read `useI18n().t` so English/Arabic RTL stay in sync.
- EPDS scoring logic lives only in `src/lib/epds.ts` with tests beside it; screening UI must not re-implement scoring.
- Phase 1 stores mood/EPDS data in browser localStorage via `src/lib/storage.ts`; swap that module when Cloud persistence is added.
- Admin-editable site content (banner, hero text, quotes, crisis lines) is one JSON row in `site_settings`, read via `src/lib/site-content.ts` and merged over defaults; only users with the `admin` role in `user_roles` can write it (RLS). Admin signs in at /admin with a username (mapped to the account email); there is no sign-up there.

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

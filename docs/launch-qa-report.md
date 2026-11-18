# Motive — launch QA report (updated 2026-11-18, after fixes)

**Status: all code and database items are fixed and were re-tested with a signed-out visitor, a regular user, an invited editor, an owner and a super admin. What is left needs you (settings and decisions).**

## Fixed and re-tested
- Emails, phone numbers and volunteer contact details are no longer public (A1, A2, plus action-team members' email/phone and solutions' phone numbers, which the first pass missed).
- Private issue titles/descriptions could be read by anyone through a helper function; the function is gone and comments now follow issue visibility (new finding).
- Fake notifications/emails blocked (A3); invites can't be rewritten (A4); only owners can delete or hand over an issue/community (A6); guests can no longer wipe other guests' supports/votes and nobody can act as someone else (A7).
- Email function rebuilt: no caller-supplied recipients, text or links; escaped HTML; one email per record (A5). Not live-tested: it needs the Resend key first.
- Private communities work for approved viewers, with a request-access screen instead of a 404 (C3).
- Issue settings are enforced: allow suggestions, login to support/vote (with a sign-in prompt, no raw database error), voting close date (C1/C2). "Goes live" and "Hidden after" were removed from the wizard because they were never implemented.
- Timeline updates can be edited and deleted (C5). Comments can be deleted by author/admin.
- Volunteers' contact details are now visible to the issue's organizers ("People who offered to help"), which was missing.
- Account deletion works, is explained honestly on the Profile page, and anonymises comments (C4).
- Fake "AI" pros & cons removed (C6); "You're live!" link fixed (C7); branded 404 and error pages added (B5); `/design-system` and six unused components removed (B7); test junk removed (43 comments, 10 solutions, 1 issue, 3 communities) (B6).
- Database speed: 27 missing foreign-key indexes added.

## Tested with test users (created, then deleted)
Sign-in; commenting, replying and deleting your own comment; support at "willing to help" level with contact details stored privately; vote and undo; request access to a private issue and a private community (no title/name leaks); owner approves from the inbox (requester email shown only to the owner); invite an existing user as editor and accept the invite link; editor sees Edit but no Delete; editor posts, edits and deletes a timeline update; rules for suggestions off, voting closed and login-required; account deletion with sent invites.

## Still needs you
1. **Supabase → Auth → URL configuration:** Site URL `https://tachlis.vercel.app` (or your domain) and Redirect URLs. Sign-in emails still go to localhost until then.
2. **Vercel:** turn off Deployment Protection for production.
3. **Email:** add `RESEND_API_KEY` and `RESEND_FROM` (a verified sender) to the Supabase function secrets, optionally `SITE_URL`. Then send yourself a test invite. Until then, use "Copy invite link" in the share panel.
4. **Contact address:** `admin@tachlis.org` is still in the footer, Terms, Privacy and the action-team panel. Tell me the new address and I'll replace it.
5. Supabase → Auth → enable leaked-password protection. Lawyer review of Terms and Privacy.

## Known small items (not launch blockers)
- A timeline update shows the issue owner's name even when an editor posted it.
- No social-share image yet; no rate limiting; categories can be added by any signed-in user.
- Status label/colour settings still don't change the badges (needs your go-ahead).
- Remaining Supabase advisor notes are the intended public/checked functions and the `pg_net` extension location.

-- =============================================
-- RLS policies for production tables
-- =============================================

-- image_fingerprints: anyone can read (for duplicate detection), only service role can write
create policy "Anyone can read fingerprints"
  on public.image_fingerprints for select
  using (true);

create policy "Service role inserts fingerprints"
  on public.image_fingerprints for insert
  with check (
    (select auth.role()) = 'service_role'
  );

create policy "Service role updates fingerprints"
  on public.image_fingerprints for update
  using (
    (select auth.role()) = 'service_role'
  );

-- ticket_codes: anyone can read (for duplicate checking), only service role can write
create policy "Anyone can read ticket codes"
  on public.ticket_codes for select
  using (true);

create policy "Service role inserts ticket codes"
  on public.ticket_codes for insert
  with check (
    (select auth.role()) = 'service_role'
  );

create policy "Service role updates ticket codes"
  on public.ticket_codes for update
  using (
    (select auth.role()) = 'service_role'
  );

-- community_reports: anyone can read, only service role can insert/update
create policy "Anyone can read community reports"
  on public.community_reports for select
  using (true);

create policy "Service role inserts community reports"
  on public.community_reports for insert
  with check (
    (select auth.role()) = 'service_role'
  );

create policy "Service role updates community reports"
  on public.community_reports for update
  using (
    (select auth.role()) = 'service_role'
  );

-- Deny all deletes except service_role
create policy "Service role deletes fingerprints"
  on public.image_fingerprints for delete
  using (
    (select auth.role()) = 'service_role'
  );

create policy "Service role deletes ticket codes"
  on public.ticket_codes for delete
  using (
    (select auth.role()) = 'service_role'
  );

create policy "Service role deletes community reports"
  on public.community_reports for delete
  using (
    (select auth.role()) = 'service_role'
  );

-- Order status history, for the public order-tracking page (app/track) and
-- follow-up emails (lib/email.js). Run after 0001/0002.
-- (orders.customer_email is defined directly in 0001_init.sql.)

create table order_status_history (
  id         bigserial primary key,
  order_id   text not null references orders (id) on delete cascade,
  status     text not null,
  created_at timestamptz not null default now()
);

create index order_status_history_order_id_idx on order_status_history (order_id, created_at);

-- Logs every status an order has ever been in, including the first one at
-- creation — a trigger (not app code) does this so it stays correct
-- regardless of which code path writes to `orders` (place_order() today,
-- a future manual WhatsApp-order entry tomorrow).
create or replace function log_order_status_change()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    insert into order_status_history (order_id, status) values (new.id, new.status);
  elsif TG_OP = 'UPDATE' and old.status is distinct from new.status then
    insert into order_status_history (order_id, status) values (new.id, new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists orders_status_history_trigger on orders;
create trigger orders_status_history_trigger
  after insert or update on orders
  for each row execute function log_order_status_change();

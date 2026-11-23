import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useConfirm } from "@/lib/confirm";
import { formatDate, inr } from "@/lib/format";
import { resolveImage } from "@/lib/images";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUS_TONE, PAYMENT_LABELS } from "@/lib/labels";
import type { Order, OrderStatus } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { SmartImage } from "@/components/SmartImage";
import { AdminPageHeader, DetailGrid, EmptyRow, RowActions, SearchBox, StatusPill, TableCard, adminHead } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/orders")({
  head: () => adminHead("Orders", "View orders, customer details and update order status."),
  component: OrdersAdmin,
});

function OrdersAdmin() {
  const { data, upsert, remove, logActivity } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [viewId, setViewId] = useState<string | null>(null);
  const view = data.orders.find((o) => o.id === viewId) ?? null;

  const ql = q.trim().toLowerCase();
  const list = data.orders.filter(
    (o) => (status === "all" || o.status === status) && (!ql || [o.id, o.customer.name, o.customer.phone, o.customer.email, o.customer.city].join(" ").toLowerCase().includes(ql)),
  );

  const setOrderStatus = (o: Order, s: OrderStatus) => {
    if (o.status === s) return;
    upsert("orders", { ...o, status: s });
    logActivity(`Order ${o.id} marked as ${ORDER_STATUS_LABELS[s]}`);
    toast("success", "Order status updated", `${o.id} → ${ORDER_STATUS_LABELS[s]}`);
  };
  const del = async (o: Order) => {
    if (!(await confirm({ title: `Delete order ${o.id}?`, message: "This removes the order from the demo records. This cannot be undone." }))) return;
    remove("orders", o.id);
    if (viewId === o.id) setViewId(null);
    logActivity(`Order ${o.id} deleted`);
    toast("success", "Order deleted", o.id);
  };

  return (
    <div>
      <AdminPageHeader title="Orders" subtitle={`${data.orders.length} orders · demo records, no real payments.`} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox value={q} onChange={setQ} placeholder="Search order ID, name, phone" />
        <select className="field py-2.5! sm:max-w-[200px]" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "all")}>
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      <TableCard>
        <table className="table-base">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th className="text-right!">Actions</th></tr></thead>
          <tbody>
            {list.length === 0 && <EmptyRow colSpan={8} text="No orders found." />}
            {list.map((o) => (
              <tr key={o.id}>
                <td className="font-bold whitespace-nowrap">{o.id}</td>
                <td><p className="font-semibold">{o.customer.name}</p><p className="text-xs text-muted-foreground">{o.customer.phone}</p></td>
                <td className="whitespace-nowrap text-muted-foreground">{formatDate(o.createdAt)}</td>
                <td>{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                <td className="font-bold whitespace-nowrap">{inr(o.total)}</td>
                <td className="whitespace-nowrap text-xs">{PAYMENT_LABELS[o.paymentMethod]}</td>
                <td>
                  <select className="field py-1.5! text-xs! min-w-[120px]" aria-label={`Status of ${o.id}`} value={o.status} onChange={(e) => setOrderStatus(o, e.target.value as OrderStatus)}>
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
                  </select>
                </td>
                <td><RowActions name={o.id} onView={() => setViewId(o.id)} onDelete={() => del(o)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <Modal open={!!view} onClose={() => setViewId(null)} title={`Order ${view?.id ?? ""}`} size="lg">
        {view && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2"><StatusPill tone={ORDER_STATUS_TONE[view.status]}>{ORDER_STATUS_LABELS[view.status]}</StatusPill><span className="text-sm text-muted-foreground">{formatDate(view.createdAt, true)}</span></div>
              <label className="flex items-center gap-2 text-sm font-bold">Update status
                <select className="field py-2! min-w-[150px]" value={view.status} onChange={(e) => setOrderStatus(view, e.target.value as OrderStatus)}>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
                </select>
              </label>
            </div>
            <section>
              <h3 className="mb-3 text-sm font-extrabold tracking-wide text-muted-foreground uppercase">Customer</h3>
              <DetailGrid items={[["Name", view.customer.name], ["Mobile", view.customer.phone], ["Email", view.customer.email], ["Payment method", PAYMENT_LABELS[view.paymentMethod]], ["Delivery address", `${view.customer.address}, ${view.customer.city}, ${view.customer.state} – ${view.customer.pin}`]]} />
            </section>
            <section>
              <h3 className="mb-3 text-sm font-extrabold tracking-wide text-muted-foreground uppercase">Items</h3>
              <ul className="divide-y divide-border rounded-2xl border border-border">
                {view.items.map((i) => (
                  <li key={i.productId + i.weight} className="flex items-center gap-3 p-3">
                    <SmartImage src={resolveImage(i.image)} alt={i.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1"><p className="truncate font-semibold">{i.name}</p><p className="text-xs text-muted-foreground">{i.weight} · {inr(i.unitPrice)} × {i.qty}</p></div>
                    <p className="font-bold">{inr(i.unitPrice * i.qty)}</p>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 ml-auto max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-semibold">{inr(view.subtotal)}</dd></div>
                {view.discount > 0 && <div className="flex justify-between text-success"><dt>Coupon {view.couponCode}</dt><dd className="font-semibold">−{inr(view.discount)}</dd></div>}
                <div className="flex justify-between"><dt>Delivery</dt><dd className="font-semibold">{view.delivery ? inr(view.delivery) : "Free"}</dd></div>
                <div className="flex justify-between border-t border-border pt-2 text-base"><dt className="font-bold">Total</dt><dd className="font-extrabold text-primary">{inr(view.total)}</dd></div>
              </dl>
            </section>
          </div>
        )}
      </Modal>
    </div>
  );
}

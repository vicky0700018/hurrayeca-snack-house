import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useConfirm } from "@/lib/confirm";
import { EMAIL_RE, PHONE_RE, digitsOnly, formatDate, inr } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/lib/labels";
import type { Customer } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { AdminPageHeader, DetailGrid, EmptyRow, Field, RowActions, SearchBox, StatusPill, TableCard, adminHead } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/customers")({
  head: () => adminHead("Customers", "Customer contact details and order history."),
  component: CustomersAdmin,
});

function CustomersAdmin() {
  const { data, upsert, remove, logActivity } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [q, setQ] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);
  const [d, setD] = useState<Customer | null>(null);
  const [er, setEr] = useState<Record<string, string>>({});
  const view = data.customers.find((c) => c.id === viewId) ?? null;
  const ordersOf = (c: Customer) => data.orders.filter((o) => o.customer.phone === c.phone || (c.email && o.customer.email.toLowerCase() === c.email.toLowerCase()));

  const ql = q.trim().toLowerCase();
  const list = data.customers.filter((c) => !ql || [c.name, c.email, c.phone, c.city].join(" ").toLowerCase().includes(ql));

  const save = () => {
    if (!d) return;
    const x: Record<string, string> = {};
    const phone = digitsOnly(d.phone);
    if (d.name.trim().length < 2) x["name"] = "Enter the customer's name";
    if (!EMAIL_RE.test(d.email.trim())) x["email"] = "Enter a valid email";
    if (!PHONE_RE.test(phone)) x["phone"] = "Enter a 10-digit mobile number";
    else if (data.customers.some((c) => c.id !== d.id && c.phone === phone)) x["phone"] = "Another customer has this number";
    setEr(x);
    if (Object.keys(x).length) return toast("error", "Please fix the highlighted fields");
    upsert("customers", { ...d, name: d.name.trim(), email: d.email.trim(), phone, city: d.city.trim() });
    logActivity(`Customer ${d.name.trim()} updated`);
    toast("success", "Customer updated", d.name.trim());
    setD(null);
  };
  const del = async (c: Customer) => {
    if (!(await confirm({ title: `Delete ${c.name}?`, message: "Their past orders stay in Orders; only the customer record is removed." }))) return;
    remove("customers", c.id);
    logActivity(`Customer ${c.name} deleted`);
    toast("success", "Customer deleted", c.name);
  };

  return (
    <div>
      <AdminPageHeader title="Customers" subtitle={`${data.customers.length} customers · added automatically when an order is placed.`} />
      <div className="mb-4"><SearchBox value={q} onChange={setQ} placeholder="Search name, email, phone, city" /></div>
      <TableCard>
        <table className="table-base">
          <thead><tr><th>Customer</th><th>Phone</th><th>City</th><th>Orders</th><th>Total spent</th><th>Since</th><th className="text-right!">Actions</th></tr></thead>
          <tbody>
            {list.length === 0 && <EmptyRow colSpan={7} text="No customers found." />}
            {list.map((c) => {
              const os = ordersOf(c);
              return (
                <tr key={c.id}>
                  <td><p className="font-semibold">{c.name}</p><p className="text-xs text-muted-foreground">{c.email}</p></td>
                  <td className="whitespace-nowrap">{c.phone}</td>
                  <td>{c.city || "—"}</td>
                  <td>{os.length}</td>
                  <td className="font-bold whitespace-nowrap">{inr(os.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0))}</td>
                  <td className="whitespace-nowrap text-muted-foreground">{formatDate(c.createdAt)}</td>
                  <td><RowActions name={c.name} onView={() => setViewId(c.id)} onEdit={() => { setEr({}); setD({ ...c }); }} onDelete={() => del(c)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableCard>

      <Modal open={!!view} onClose={() => setViewId(null)} title={view?.name ?? ""} footer={view && <button type="button" className="btn btn-primary btn-sm" onClick={() => { const c = view; setViewId(null); setEr({}); setD({ ...c }); }}>Edit customer</button>}>
        {view && (
          <div className="space-y-6">
            <DetailGrid items={[["Name", view.name], ["Email", view.email ? <a className="text-primary underline" href={`mailto:${view.email}`}>{view.email}</a> : ""], ["Mobile", <a className="text-primary underline" href={`tel:${view.phone}`}>{view.phone}</a>], ["City", view.city], ["Customer since", formatDate(view.createdAt)]]} />
            <section>
              <h3 className="mb-3 text-sm font-extrabold tracking-wide text-muted-foreground uppercase">Order history</h3>
              {ordersOf(view).length === 0 ? <p className="text-sm text-muted-foreground">No orders yet.</p> : (
                <ul className="divide-y divide-border rounded-2xl border border-border">
                  {ordersOf(view).map((o) => (
                    <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                      <div><p className="font-bold">{o.id}</p><p className="text-xs text-muted-foreground">{formatDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} items</p></div>
                      <div className="flex items-center gap-3"><StatusPill tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABELS[o.status]}</StatusPill><span className="font-bold">{inr(o.total)}</span></div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </Modal>

      <Modal open={!!d} onClose={() => setD(null)} title="Edit customer" size="sm" footer={<><button type="button" className="btn btn-muted btn-sm" onClick={() => setD(null)}>Cancel</button><button type="button" className="btn btn-primary btn-sm" onClick={save}>Save changes</button></>}>
        {d && (
          <form className="space-y-4" noValidate onSubmit={(e) => { e.preventDefault(); save(); }}>
            <Field label="Full name" htmlFor="cu-name" error={er["name"]}><input id="cu-name" className="field" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} aria-invalid={!!er["name"]} /></Field>
            <Field label="Email" htmlFor="cu-email" error={er["email"]}><input id="cu-email" type="email" className="field" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} aria-invalid={!!er["email"]} /></Field>
            <Field label="Mobile number" htmlFor="cu-phone" error={er["phone"]}><input id="cu-phone" inputMode="numeric" className="field" value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value })} aria-invalid={!!er["phone"]} /></Field>
            <Field label="City" htmlFor="cu-city"><input id="cu-city" className="field" value={d.city} onChange={(e) => setD({ ...d, city: e.target.value })} /></Field>
          </form>
        )}
      </Modal>
    </div>
  );
}

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useConfirm } from "@/lib/confirm";
import { formatDate } from "@/lib/format";
import { ENQUIRY_LABELS, ENQUIRY_STATUSES, ENQUIRY_TONE } from "@/lib/labels";
import type { Enquiry, EnquiryStatus } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { AdminPageHeader, DetailGrid, EmptyRow, RowActions, SearchBox, StatusPill, TableCard, adminHead } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/enquiries")({
  head: () => adminHead("Enquiries", "Messages sent from the Contact Us page."),
  component: EnquiriesAdmin,
});

function EnquiriesAdmin() {
  const { data, upsert, remove, logActivity } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<EnquiryStatus | "all">("all");
  const [viewId, setViewId] = useState<string | null>(null);
  const view = data.enquiries.find((e) => e.id === viewId) ?? null;

  const ql = q.trim().toLowerCase();
  const list = data.enquiries.filter(
    (e) => (status === "all" || e.status === status) && (!ql || [e.name, e.email, e.phone, e.subject, e.message].join(" ").toLowerCase().includes(ql)),
  );

  const setEnqStatus = (e: Enquiry, s: EnquiryStatus) => {
    if (e.status === s) return;
    upsert("enquiries", { ...e, status: s });
    logActivity(`Enquiry from ${e.name} marked ${ENQUIRY_LABELS[s]}`);
    toast("success", "Enquiry updated", `${e.name} → ${ENQUIRY_LABELS[s]}`);
  };
  const del = async (e: Enquiry) => {
    if (!(await confirm({ title: `Delete enquiry from ${e.name}?`, message: "This message will be permanently removed." }))) return;
    remove("enquiries", e.id);
    if (viewId === e.id) setViewId(null);
    logActivity(`Enquiry from ${e.name} deleted`);
    toast("success", "Enquiry deleted");
  };

  const statusSelect = (e: Enquiry, cls = "") => (
    <select className={"field " + cls} aria-label={`Status of enquiry from ${e.name}`} value={e.status} onChange={(ev) => setEnqStatus(e, ev.target.value as EnquiryStatus)}>
      {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{ENQUIRY_LABELS[s]}</option>)}
    </select>
  );

  return (
    <div>
      <AdminPageHeader title="Contact Enquiries" subtitle={`${data.enquiries.length} enquiries · ${data.enquiries.filter((e) => e.status === "new").length} new.`} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox value={q} onChange={setQ} placeholder="Search enquiries" />
        <select className="field py-2.5! sm:max-w-[200px]" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value as EnquiryStatus | "all")}>
          <option value="all">All statuses</option>
          {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{ENQUIRY_LABELS[s]}</option>)}
        </select>
      </div>
      <TableCard>
        <table className="table-base">
          <thead><tr><th>From</th><th>Subject</th><th>Date</th><th>Status</th><th className="text-right!">Actions</th></tr></thead>
          <tbody>
            {list.length === 0 && <EmptyRow colSpan={5} text="No enquiries found." />}
            {list.map((e) => (
              <tr key={e.id}>
                <td><p className="font-semibold">{e.name}</p><p className="text-xs text-muted-foreground">{e.email} · {e.phone}</p></td>
                <td><p className="max-w-[280px] truncate font-semibold">{e.subject}</p><p className="max-w-[280px] truncate text-xs text-muted-foreground">{e.message}</p></td>
                <td className="whitespace-nowrap text-muted-foreground">{formatDate(e.createdAt)}</td>
                <td>{statusSelect(e, "py-1.5! text-xs! min-w-[120px]")}</td>
                <td><RowActions name={`enquiry from ${e.name}`} onView={() => setViewId(e.id)} onDelete={() => del(e)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <Modal open={!!view} onClose={() => setViewId(null)} title={view?.subject ?? ""} footer={view && <><button type="button" className="btn btn-danger btn-sm" onClick={() => del(view)}>Delete</button><a className="btn btn-primary btn-sm" href={`mailto:${view.email}?subject=${encodeURIComponent("Re: " + view.subject)}`}>Reply by email</a></>}>
        {view && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusPill tone={ENQUIRY_TONE[view.status]}>{ENQUIRY_LABELS[view.status]}</StatusPill>
              <label className="flex items-center gap-2 text-sm font-bold">Update status {statusSelect(view, "py-2! min-w-[150px]")}</label>
            </div>
            <DetailGrid items={[["Name", view.name], ["Email", view.email], ["Mobile", <a className="text-primary underline" href={`tel:${view.phone}`}>{view.phone}</a>], ["Received", formatDate(view.createdAt, true)]]} />
            <div><p className="label">Message</p><p className="rounded-2xl bg-muted p-4 text-sm leading-relaxed whitespace-pre-wrap">{view.message}</p></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

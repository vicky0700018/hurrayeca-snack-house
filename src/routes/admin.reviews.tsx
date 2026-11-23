import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useConfirm } from "@/lib/confirm";
import { formatDate } from "@/lib/format";
import type { Review } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { Stars } from "@/components/site/Stars";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { AdminPageHeader, DetailGrid, EmptyRow, RowActions, SearchBox, StatusPill, TableCard, adminHead } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/reviews")({
  head: () => adminHead("Reviews", "Approve or delete customer reviews."),
  component: ReviewsAdmin,
});

type Filter = "all" | "pending" | "approved";

function ReviewsAdmin() {
  const { data, upsert, remove, logActivity } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [viewId, setViewId] = useState<string | null>(null);
  const view = data.reviews.find((r) => r.id === viewId) ?? null;
  const productName = (id: string) => data.products.find((p) => p.id === id)?.name ?? "Deleted product";

  const ql = q.trim().toLowerCase();
  const list = data.reviews.filter(
    (r) => (filter === "all" || (filter === "approved" ? r.approved : !r.approved)) && (!ql || [r.name, r.city, r.comment, productName(r.productId)].join(" ").toLowerCase().includes(ql)),
  );
  const pending = data.reviews.filter((r) => !r.approved).length;

  const setApproved = (r: Review, approved: boolean) => {
    upsert("reviews", { ...r, approved });
    logActivity(`Review by ${r.name} ${approved ? "approved" : "hidden"}`);
    toast("success", approved ? "Review approved" : "Review hidden", approved ? "It now shows on the website." : "It no longer shows on the website.");
  };
  const del = async (r: Review) => {
    if (!(await confirm({ title: `Delete review by ${r.name}?`, message: "This review will be permanently removed." }))) return;
    remove("reviews", r.id);
    if (viewId === r.id) setViewId(null);
    logActivity(`Review by ${r.name} deleted`);
    toast("success", "Review deleted");
  };

  const approveBtn = (r: Review) =>
    r.approved ? (
      <button type="button" className="action-btn action-edit" title="Hide" aria-label={`Hide review by ${r.name}`} onClick={() => setApproved(r, false)}><CloseIcon size={16} /></button>
    ) : (
      <button type="button" className="action-btn text-success hover:bg-success/10" title="Approve" aria-label={`Approve review by ${r.name}`} onClick={() => setApproved(r, true)}><CheckIcon size={16} /></button>
    );

  return (
    <div>
      <AdminPageHeader title="Reviews" subtitle={`${data.reviews.length} reviews · ${pending} waiting for approval. Only approved reviews show on the website.`} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox value={q} onChange={setQ} placeholder="Search reviews" />
        <div className="flex gap-2">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button key={f} type="button" className={"chip " + (filter === f ? "chip-active" : "")} onClick={() => setFilter(f)}>{f === "all" ? "All" : f === "pending" ? "Pending" : "Approved"}</button>
          ))}
        </div>
      </div>
      <TableCard>
        <table className="table-base">
          <thead><tr><th>Customer</th><th>Product</th><th>Rating</th><th>Review</th><th>Date</th><th>Status</th><th className="text-right!">Actions</th></tr></thead>
          <tbody>
            {list.length === 0 && <EmptyRow colSpan={7} text="No reviews found." />}
            {list.map((r) => (
              <tr key={r.id}>
                <td><p className="font-semibold">{r.name}</p><p className="text-xs text-muted-foreground">{r.city}</p></td>
                <td className="max-w-[160px] truncate">{productName(r.productId)}</td>
                <td><Stars value={r.rating} /></td>
                <td><p className="max-w-[260px] truncate text-muted-foreground">{r.comment}</p></td>
                <td className="whitespace-nowrap text-muted-foreground">{formatDate(r.createdAt)}</td>
                <td><StatusPill tone={r.approved ? "success" : "warning"}>{r.approved ? "Approved" : "Pending"}</StatusPill></td>
                <td><RowActions name={`review by ${r.name}`} extra={approveBtn(r)} onView={() => setViewId(r.id)} onDelete={() => del(r)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <Modal
        open={!!view}
        onClose={() => setViewId(null)}
        title={view ? `Review by ${view.name}` : ""}
        size="sm"
        footer={view && (
          <>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => del(view)}>Delete</button>
            {view.approved
              ? <button type="button" className="btn btn-muted btn-sm" onClick={() => setApproved(view, false)}>Hide from website</button>
              : <button type="button" className="btn btn-primary btn-sm" onClick={() => setApproved(view, true)}>Approve</button>}
          </>
        )}
      >
        {view && (
          <div className="space-y-4">
            <Stars value={view.rating} />
            <p className="rounded-2xl bg-muted p-4 text-sm leading-relaxed">“{view.comment}”</p>
            <DetailGrid items={[["Customer", view.name], ["City", view.city], ["Product", productName(view.productId)], ["Date", formatDate(view.createdAt)], ["Status", view.approved ? "Approved" : "Pending approval"]]} />
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { EMAIL_RE, PHONE_RE, digitsOnly } from "@/lib/format";
import type { Content, Settings } from "@/lib/types";
import { AdminPageHeader, Field, adminHead } from "@/components/admin/AdminUI";
import { PlusIcon, TrashIcon } from "@/components/icons";

export const Route = createFileRoute("/admin/content")({
  head: () => adminHead("Website Content", "Edit homepage, About Us, promotions, contact details, social links and footer."),
  component: ContentAdmin,
});

const TABS = [
  { id: "home", label: "Homepage" },
  { id: "about", label: "About Us" },
  { id: "promo", label: "Promotions" },
  { id: "contact", label: "Contact info" },
  { id: "footer", label: "Footer & social" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const HOME_FIELDS: Array<[keyof Content["home"], string, boolean]> = [
  ["categoriesTitle", "Categories – title", false],
  ["categoriesSubtitle", "Categories – subtitle", true],
  ["bestSellersTitle", "Best sellers – title", false],
  ["bestSellersSubtitle", "Best sellers – subtitle", true],
  ["featuredTitle", "Featured products – title", false],
  ["featuredSubtitle", "Featured products – subtitle", true],
  ["whyTitle", "Why choose us – title", false],
  ["testimonialsTitle", "Testimonials – title", false],
  ["newsletterTitle", "Newsletter – title", false],
  ["newsletterText", "Newsletter – text", true],
];
const ABOUT_FIELDS: Array<[Exclude<keyof Content["about"], "whyChoose">, string]> = [
  ["heroTitle", "Page title"],
  ["intro", "Company introduction"],
  ["story", "Brand story"],
  ["overview", "Business overview"],
  ["quality", "Quality commitment"],
  ["mission", "Our mission"],
  ["vision", "Our vision"],
];
const SOCIAL: Array<[keyof Settings["social"], string]> = [["facebook", "Facebook"], ["instagram", "Instagram"], ["youtube", "YouTube"], ["twitter", "X (Twitter)"], ["linkedin", "LinkedIn"]];

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function ContentAdmin() {
  const { data, updateContent, updateSettings, logActivity } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState<TabId>("home");
  const [c, setC] = useState<Content>(() => clone(data.content));
  const [s, setS] = useState<Settings>(() => clone(data.settings));
  const [er, setEr] = useState<Record<string, string>>({});
  // Pick up saved data once it loads from the browser.
  useEffect(() => { setC(clone(data.content)); setS(clone(data.settings)); }, [data.content, data.settings]);

  const fail = (x: Record<string, string>) => { setEr(x); if (Object.keys(x).length) { toast("error", "Please fix the highlighted fields"); return true; } return false; };

  const saveContent = (section: string) => {
    const x: Record<string, string> = {};
    if (tab === "home") HOME_FIELDS.forEach(([k]) => { if (!c.home[k].trim()) x[k] = "This field cannot be empty"; });
    if (tab === "home") c.why.forEach((w, i) => { if (!w.title.trim() || !w.text.trim()) x[`why${i}`] = "Add a title and text, or remove this item"; });
    if (tab === "about") ABOUT_FIELDS.forEach(([k]) => { if (!c.about[k].trim()) x[k] = "This field cannot be empty"; });
    if (fail(x)) return;
    const next: Content = { ...c, about: { ...c.about, whyChoose: c.about.whyChoose.map((w) => w.trim()).filter(Boolean) } };
    updateContent(next);
    logActivity(`${section} content updated`);
    toast("success", "Content saved", "Changes are live on the website.");
  };

  const saveSettings = (section: string, patch: Partial<Settings>, x: Record<string, string> = {}) => {
    if (fail(x)) return;
    updateSettings(patch);
    logActivity(`${section} updated`);
    toast("success", "Saved", "Changes are live on the website.");
  };

  const saveBtn = (onClick: () => void) => <div className="flex justify-end pt-2"><button type="button" className="btn btn-primary" onClick={onClick}>Save changes</button></div>;

  return (
    <div>
      <AdminPageHeader title="Website Content" subtitle="Edit the text customers see. Saving updates the public website straight away." />
      <div className="mb-5 flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={"chip " + (tab === t.id ? "chip-active" : "")} onClick={() => { setEr({}); setTab(t.id); }}>{t.label}</button>)}
      </div>

      <div className="card-surface space-y-5 p-5 sm:p-6">
        {tab === "home" && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {HOME_FIELDS.map(([k, label, long]) => (
                <Field key={k} label={label} htmlFor={`h-${k}`} error={er[k]} className={long ? "md:col-span-2" : ""}>
                  {long ? <textarea id={`h-${k}`} rows={2} className="field" value={c.home[k]} onChange={(e) => setC({ ...c, home: { ...c.home, [k]: e.target.value } })} aria-invalid={!!er[k]} />
                        : <input id={`h-${k}`} className="field" value={c.home[k]} onChange={(e) => setC({ ...c, home: { ...c.home, [k]: e.target.value } })} aria-invalid={!!er[k]} />}
                </Field>
              ))}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between"><h2 className="text-lg font-semibold">“Why choose us” points</h2>
                <button type="button" className="btn btn-muted btn-sm" disabled={c.why.length >= 8} onClick={() => setC({ ...c, why: [...c.why, { title: "", text: "" }] })}><PlusIcon size={15} /> Add point</button>
              </div>
              <div className="space-y-3">
                {c.why.map((w, i) => (
                  <div key={i} className="grid gap-2 rounded-2xl border border-border p-3 sm:grid-cols-[1fr_2fr_auto]">
                    <input className="field" aria-label={`Point ${i + 1} title`} placeholder="Title" value={w.title} onChange={(e) => setC({ ...c, why: c.why.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
                    <input className="field" aria-label={`Point ${i + 1} text`} placeholder="Short text" value={w.text} onChange={(e) => setC({ ...c, why: c.why.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
                    <button type="button" className="action-btn action-delete self-center" aria-label={`Remove point ${i + 1}`} onClick={() => setC({ ...c, why: c.why.filter((_, j) => j !== i) })}><TrashIcon size={16} /></button>
                    {er[`why${i}`] && <p className="field-error sm:col-span-3">{er[`why${i}`]}</p>}
                  </div>
                ))}
              </div>
            </div>
            {saveBtn(() => saveContent("Homepage"))}
          </>
        )}

        {tab === "about" && (
          <>
            {ABOUT_FIELDS.map(([k, label]) => (
              <Field key={k} label={label} htmlFor={`a-${k}`} error={er[k]}>
                {k === "heroTitle" ? <input id={`a-${k}`} className="field" value={c.about[k]} onChange={(e) => setC({ ...c, about: { ...c.about, [k]: e.target.value } })} aria-invalid={!!er[k]} />
                  : <textarea id={`a-${k}`} rows={3} className="field" value={c.about[k]} onChange={(e) => setC({ ...c, about: { ...c.about, [k]: e.target.value } })} aria-invalid={!!er[k]} />}
              </Field>
            ))}
            <Field label="Why customers choose us (one per line)" htmlFor="a-why">
              <textarea id="a-why" rows={5} className="field" value={c.about.whyChoose.join("\n")} onChange={(e) => setC({ ...c, about: { ...c.about, whyChoose: e.target.value.split("\n") } })} />
            </Field>
            {saveBtn(() => saveContent("About Us"))}
          </>
        )}

        {tab === "promo" && (
          <>
            <Field label="Announcement bar messages (one per line)" htmlFor="p-ann" hint="Shown in the scrolling bar at the top of every page." error={er["announcements"]}>
              <textarea id="p-ann" rows={4} className="field" value={s.announcements.join("\n")} onChange={(e) => setS({ ...s, announcements: e.target.value.split("\n") })} aria-invalid={!!er["announcements"]} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Free delivery above (₹)" htmlFor="p-free" error={er["free"]}><input id="p-free" type="number" min={0} className="field" value={s.freeDeliveryThreshold} onChange={(e) => setS({ ...s, freeDeliveryThreshold: Number(e.target.value) })} aria-invalid={!!er["free"]} /></Field>
              <Field label="Delivery charge below that (₹)" htmlFor="p-del" error={er["del"]}><input id="p-del" type="number" min={0} className="field" value={s.deliveryCharge} onChange={(e) => setS({ ...s, deliveryCharge: Number(e.target.value) })} aria-invalid={!!er["del"]} /></Field>
            </div>
            {saveBtn(() => {
              const x: Record<string, string> = {};
              const ann = s.announcements.map((a) => a.trim()).filter(Boolean);
              if (!ann.length) x["announcements"] = "Add at least one message";
              if (!(s.freeDeliveryThreshold >= 0)) x["free"] = "Enter 0 or more";
              if (!(s.deliveryCharge >= 0)) x["del"] = "Enter 0 or more";
              saveSettings("Promotions", { announcements: ann, freeDeliveryThreshold: s.freeDeliveryThreshold, deliveryCharge: s.deliveryCharge }, x);
            })}
          </>
        )}

        {tab === "contact" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" htmlFor="c-phone" error={er["phone"]}><input id="c-phone" inputMode="numeric" className="field" value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} aria-invalid={!!er["phone"]} /></Field>
              <Field label="WhatsApp number" htmlFor="c-wa" error={er["whatsapp"]}><input id="c-wa" inputMode="numeric" className="field" value={s.whatsapp} onChange={(e) => setS({ ...s, whatsapp: e.target.value })} aria-invalid={!!er["whatsapp"]} /></Field>
              <Field label="Email" htmlFor="c-email" error={er["email"]} className="sm:col-span-2"><input id="c-email" type="email" className="field" value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} aria-invalid={!!er["email"]} /></Field>
            </div>
            <Field label="Address" htmlFor="c-addr" hint="Leave empty to show “Address will be updated soon”."><textarea id="c-addr" rows={3} className="field" value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} /></Field>
            <Field label="Contact persons (one per line)" htmlFor="c-people" error={er["people"]}><textarea id="c-people" rows={3} className="field" value={s.contactPersons.join("\n")} onChange={(e) => setS({ ...s, contactPersons: e.target.value.split("\n") })} aria-invalid={!!er["people"]} /></Field>
            {saveBtn(() => {
              const x: Record<string, string> = {};
              const phone = digitsOnly(s.phone), wa = digitsOnly(s.whatsapp);
              const people = s.contactPersons.map((p) => p.trim()).filter(Boolean);
              if (!PHONE_RE.test(phone)) x["phone"] = "Enter a 10-digit phone number";
              if (wa.length < 10 || wa.length > 13) x["whatsapp"] = "Enter a 10-digit number (or with country code)";
              if (!EMAIL_RE.test(s.email.trim())) x["email"] = "Enter a valid email";
              if (!people.length) x["people"] = "Add at least one contact person";
              saveSettings("Contact information", { phone, whatsapp: wa, email: s.email.trim(), address: s.address.trim(), contactPersons: people }, x);
            })}
          </>
        )}

        {tab === "footer" && (
          <>
            <Field label="Footer description" htmlFor="f-about" error={er["footerAbout"]}><textarea id="f-about" rows={3} className="field" value={s.footerAbout} onChange={(e) => setS({ ...s, footerAbout: e.target.value })} aria-invalid={!!er["footerAbout"]} /></Field>
            <p className="text-xs text-muted-foreground">The credit line “Designed and development by SOSynch Ai Tech” always stays in the footer.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {SOCIAL.map(([k, label]) => (
                <Field key={k} label={`${label} link`} htmlFor={`s-${k}`} error={er[k]} hint="Leave empty to hide this icon.">
                  <input id={`s-${k}`} type="url" className="field" placeholder="https://" value={s.social[k]} onChange={(e) => setS({ ...s, social: { ...s.social, [k]: e.target.value } })} aria-invalid={!!er[k]} />
                </Field>
              ))}
            </div>
            {saveBtn(() => {
              const x: Record<string, string> = {};
              if (s.footerAbout.trim().length < 10) x["footerAbout"] = "Write at least a short sentence";
              SOCIAL.forEach(([k]) => { const v = s.social[k].trim(); if (v && !/^https?:\/\/\S+\.\S+/.test(v)) x[k] = "Enter a full link starting with https://"; });
              const social = Object.fromEntries(SOCIAL.map(([k]) => [k, s.social[k].trim()])) as Settings["social"];
              saveSettings("Footer & social links", { footerAbout: s.footerAbout.trim(), social }, x);
            })}
          </>
        )}
      </div>
    </div>
  );
}

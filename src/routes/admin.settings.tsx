import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useConfirm } from "@/lib/confirm";
import { EMAIL_RE, PHONE_RE, digitsOnly } from "@/lib/format";
import { AdminPageHeader, Field, ImagePicker, adminHead } from "@/components/admin/AdminUI";
import { LockIcon, RefreshIcon } from "@/components/icons";

export const Route = createFileRoute("/admin/settings")({
  head: () => adminHead("Settings", "Company details, logo, admin profile, password and demo data reset."),
  component: SettingsAdmin,
});

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="card-surface space-y-4 p-5 sm:p-6">
      <div><h2 className="text-lg font-semibold">{title}</h2>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
      {children}
    </section>
  );
}

function SettingsAdmin() {
  const { data, updateSettings, logActivity, resetDemo } = useStore();
  const toast = useToast();
  const confirm = useConfirm();
  const s = data.settings;

  const [co, setCo] = useState({ companyName: s.companyName, brandName: s.brandName, tagline: s.tagline, phone: s.phone, whatsapp: s.whatsapp, email: s.email, address: s.address, logo: s.logo });
  const [prof, setProf] = useState({ adminName: s.adminName, adminEmail: s.adminEmail });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [er, setEr] = useState<Record<string, string>>({});
  useEffect(() => {
    setCo({ companyName: s.companyName, brandName: s.brandName, tagline: s.tagline, phone: s.phone, whatsapp: s.whatsapp, email: s.email, address: s.address, logo: s.logo });
    setProf({ adminName: s.adminName, adminEmail: s.adminEmail });
  }, [s]);

  const check = (x: Record<string, string>) => { setEr(x); if (Object.keys(x).length) { toast("error", "Please fix the highlighted fields"); return false; } return true; };

  const saveCompany = () => {
    const x: Record<string, string> = {};
    const phone = digitsOnly(co.phone), whatsapp = digitsOnly(co.whatsapp);
    if (co.companyName.trim().length < 3) x["companyName"] = "Enter the company name";
    if (co.brandName.trim().length < 2) x["brandName"] = "Enter the brand name";
    if (!PHONE_RE.test(phone)) x["phone"] = "Enter a 10-digit phone number";
    if (whatsapp.length < 10 || whatsapp.length > 13) x["whatsapp"] = "Enter a 10-digit number (or with country code)";
    if (!EMAIL_RE.test(co.email.trim())) x["email"] = "Enter a valid email";
    if (!check(x)) return;
    updateSettings({ ...co, companyName: co.companyName.trim(), brandName: co.brandName.trim(), tagline: co.tagline.trim(), phone, whatsapp, email: co.email.trim(), address: co.address.trim() });
    logActivity("Company information updated");
    toast("success", "Company information saved", "Phone, WhatsApp and logo update across the website.");
  };

  const saveProfile = () => {
    const x: Record<string, string> = {};
    if (prof.adminName.trim().length < 2) x["adminName"] = "Enter your name";
    if (!EMAIL_RE.test(prof.adminEmail.trim())) x["adminEmail"] = "Enter a valid email";
    if (!check(x)) return;
    updateSettings({ adminName: prof.adminName.trim(), adminEmail: prof.adminEmail.trim().toLowerCase() });
    logActivity("Admin profile updated");
    toast("success", "Profile saved", "Use this email next time you log in.");
  };

  const savePassword = () => {
    const x: Record<string, string> = {};
    if (pw.current !== s.adminPassword) x["current"] = "Current password is incorrect";
    if (pw.next.length < 8 || !/[A-Za-z]/.test(pw.next) || !/\d/.test(pw.next)) x["next"] = "Use at least 8 characters with letters and a number";
    else if (pw.next === pw.current) x["next"] = "Choose a different password";
    if (pw.confirm !== pw.next) x["confirm"] = "Passwords do not match";
    if (!check(x)) return;
    updateSettings({ adminPassword: pw.next });
    setPw({ current: "", next: "", confirm: "" });
    logActivity("Admin password changed");
    toast("success", "Password changed", "Use the new password next time you log in.");
  };

  const reset = async () => {
    if (!(await confirm({ title: "Reset all demo data?", message: "All products, categories, orders, customers, reviews, coupons, banners, enquiries, content and settings go back to the original demo data. Cart and wishlist are cleared. The admin password goes back to Admin@123.", confirmText: "Reset demo data", danger: true }))) return;
    resetDemo();
    toast("success", "Demo data restored", "Everything is back to the original demo.");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Settings" subtitle="Company details, admin login and demo data." />

      <Section title="Company information" subtitle="Used in the header, footer, Contact page and floating WhatsApp / Call buttons.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" htmlFor="st-co" error={er["companyName"]}><input id="st-co" className="field" value={co.companyName} onChange={(e) => setCo({ ...co, companyName: e.target.value })} aria-invalid={!!er["companyName"]} /></Field>
          <Field label="Brand name (logo text)" htmlFor="st-brand" error={er["brandName"]}><input id="st-brand" className="field" value={co.brandName} onChange={(e) => setCo({ ...co, brandName: e.target.value })} aria-invalid={!!er["brandName"]} /></Field>
          <Field label="Tagline" htmlFor="st-tag" className="sm:col-span-2"><input id="st-tag" className="field" value={co.tagline} onChange={(e) => setCo({ ...co, tagline: e.target.value })} /></Field>
          <Field label="Business phone" htmlFor="st-phone" error={er["phone"]}><input id="st-phone" inputMode="numeric" className="field" value={co.phone} onChange={(e) => setCo({ ...co, phone: e.target.value })} aria-invalid={!!er["phone"]} /></Field>
          <Field label="WhatsApp number" htmlFor="st-wa" error={er["whatsapp"]}><input id="st-wa" inputMode="numeric" className="field" value={co.whatsapp} onChange={(e) => setCo({ ...co, whatsapp: e.target.value })} aria-invalid={!!er["whatsapp"]} /></Field>
          <Field label="Email" htmlFor="st-email" error={er["email"]} className="sm:col-span-2"><input id="st-email" type="email" className="field" value={co.email} onChange={(e) => setCo({ ...co, email: e.target.value })} aria-invalid={!!er["email"]} /></Field>
          <Field label="Address" htmlFor="st-addr" className="sm:col-span-2"><textarea id="st-addr" rows={2} className="field" value={co.address} onChange={(e) => setCo({ ...co, address: e.target.value })} /></Field>
        </div>
        <ImagePicker label="Logo (optional – leave empty to use the built-in HURRAYECA logo)" value={co.logo} onChange={(v) => setCo({ ...co, logo: v })} allowClear />
        <div className="flex justify-end"><button type="button" className="btn btn-primary" onClick={saveCompany}>Save company information</button></div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Admin profile">
          <Field label="Name" htmlFor="st-an" error={er["adminName"]}><input id="st-an" className="field" value={prof.adminName} onChange={(e) => setProf({ ...prof, adminName: e.target.value })} aria-invalid={!!er["adminName"]} /></Field>
          <Field label="Login email" htmlFor="st-ae" error={er["adminEmail"]}><input id="st-ae" type="email" className="field" value={prof.adminEmail} onChange={(e) => setProf({ ...prof, adminEmail: e.target.value })} aria-invalid={!!er["adminEmail"]} /></Field>
          <div className="flex justify-end"><button type="button" className="btn btn-primary" onClick={saveProfile}>Save profile</button></div>
        </Section>

        <Section title="Change demo password" subtitle="Stored only in this browser for the demo.">
          <form className="space-y-4" noValidate onSubmit={(e) => { e.preventDefault(); savePassword(); }}>
            <Field label="Current password" htmlFor="st-pc" error={er["current"]}><input id="st-pc" type="password" autoComplete="current-password" className="field" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} aria-invalid={!!er["current"]} /></Field>
            <Field label="New password" htmlFor="st-pn" error={er["next"]}><input id="st-pn" type="password" autoComplete="new-password" className="field" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} aria-invalid={!!er["next"]} /></Field>
            <Field label="Confirm new password" htmlFor="st-pf" error={er["confirm"]}><input id="st-pf" type="password" autoComplete="new-password" className="field" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} aria-invalid={!!er["confirm"]} /></Field>
            <div className="flex justify-end"><button type="submit" className="btn btn-primary"><LockIcon size={16} /> Change password</button></div>
          </form>
        </Section>
      </div>

      <Section title="Reset demo data" subtitle="Restore the original products, orders, content and settings.">
        <div><button type="button" className="btn btn-danger" onClick={reset}><RefreshIcon size={16} /> Reset to demo data</button></div>
      </Section>
    </div>
  );
}

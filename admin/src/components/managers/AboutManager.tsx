import { useRef, useState } from "react";
import { Check, ExternalLink, ImageUp, Info, Plus, Save, X } from "lucide-react";
import { useStore } from "../../App";
import { aboutApi } from "../../lib/adminApi";
import { supabase } from "../../lib/supabase";
import type { AppAbout } from "../../lib/data";

function Field({
  label, value, onChange, textarea, placeholder, error, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  textarea?: boolean; placeholder?: string; error?: string; type?: string;
}) {
  const base = "w-full rounded-xl border bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none transition-colors";
  const cls = `${base} ${error ? "border-[var(--destructive)]/60 focus:border-[var(--destructive)]" : "border-[var(--border)] focus:border-[var(--gold)]"}`;
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${cls} resize-none`} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
      {error && <p className="mt-1 text-[11px] text-[var(--destructive)]">{error}</p>}
    </div>
  );
}

function validateAbout(a: AppAbout): Record<string, string> {
  const e: Record<string, string> = {};
  if (!a.appName.trim())       e.appName = "App name is required.";
  if (!a.tagline.trim())       e.tagline = "Tagline is required.";
  if (!a.version.trim())       e.version = "Version is required.";
  if (!a.description.trim())   e.description = "Description is required.";
  if (!a.supportEmail.trim())  e.supportEmail = "Support email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.supportEmail)) e.supportEmail = "Enter a valid email.";
  return e;
}

export function AboutManager() {
  const { store, refresh } = useStore();
  const [form, setForm] = useState<AppAbout>(structuredClone(store.about));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePhotoUpload = async (i: number, file: File) => {
    setUploading((u) => ({ ...u, [i]: true }));
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `member_${i}_${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from("team-photos").upload(path, file, { upsert: true });
      if (error) { alert(`Upload failed: ${error.message}`); return; }
      const { data: { publicUrl } } = supabase.storage.from("team-photos").getPublicUrl(data.path);
      updateTeamMember(i, "photo", publicUrl);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading((u) => ({ ...u, [i]: false }));
    }
  };

  const set = <K extends keyof AppAbout>(key: K, value: AppAbout[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
    setSaved(false);
  };

  const handleSave = async () => {
    const errs = validateAbout(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      await aboutApi.update({
        app_name: form.appName, tagline: form.tagline, version: form.version,
        description: form.description, support_email: form.supportEmail,
        website_url: form.websiteUrl, privacy_url: form.privacyUrl,
        terms_url: form.termsUrl, play_store_url: form.playStoreUrl,
        app_store_url: form.appStoreUrl, team_members: form.teamMembers,
        social_links: form.socialLinks,
      });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) { alert(err.message); }
  };

  const addTeamMember = () => set("teamMembers", [...form.teamMembers, { name: "", role: "", photo: "" }]);
  const removeTeamMember = (i: number) => set("teamMembers", form.teamMembers.filter((_, idx) => idx !== i));
  const updateTeamMember = (i: number, field: "name" | "role" | "photo", val: string) =>
    set("teamMembers", form.teamMembers.map((m, idx) => idx === i ? { ...m, [field]: val } : m));

  const addSocialLink = () => set("socialLinks", [...form.socialLinks, { platform: "", url: "" }]);
  const removeSocialLink = (i: number) => set("socialLinks", form.socialLinks.filter((_, idx) => idx !== i));
  const updateSocialLink = (i: number, field: "platform" | "url", val: string) =>
    set("socialLinks", form.socialLinks.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">About Section</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Edit the About content shown in the mobile app</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
            saved ? "bg-emerald-500/20 text-emerald-400" : "gold-gradient text-[#1a1410]"
          }`}
        >
          {saved ? <><Check className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Changes</>}
        </button>
      </div>

      {/* Basic info */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Info className="h-4 w-4 text-[var(--gold)]" />
          <p className="text-sm font-bold text-[var(--foreground)]">App Identity</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="App Name"    value={form.appName}    onChange={(v) => set("appName", v)}    placeholder="KrackIT"              error={errors.appName}    />
          <Field label="Version"     value={form.version}    onChange={(v) => set("version", v)}    placeholder="2.1.0"                error={errors.version}    />
        </div>
        <Field label="Tagline"       value={form.tagline}    onChange={(v) => set("tagline", v)}    placeholder="One trick ahead"      error={errors.tagline}    />
        <Field label="Description"   value={form.description} onChange={(v) => set("description", v)} placeholder="Tell users what this app does…" textarea error={errors.description} />
        <Field label="Support Email" value={form.supportEmail} onChange={(v) => set("supportEmail", v)} placeholder="support@krackit.app" type="email" error={errors.supportEmail} />
      </div>

      {/* Links */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ExternalLink className="h-4 w-4 text-[var(--gold)]" />
          <p className="text-sm font-bold text-[var(--foreground)]">Links</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Field label="Website URL"     value={form.websiteUrl}    onChange={(v) => set("websiteUrl", v)}    placeholder="https://krackit.app"          />
          <Field label="Privacy Policy URL" value={form.privacyUrl} onChange={(v) => set("privacyUrl", v)}   placeholder="https://krackit.app/privacy"   />
          <Field label="Terms of Service URL" value={form.termsUrl} onChange={(v) => set("termsUrl", v)}     placeholder="https://krackit.app/terms"     />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Play Store URL"  value={form.playStoreUrl} onChange={(v) => set("playStoreUrl", v)} placeholder="https://play.google.com/…" />
            <Field label="App Store URL"   value={form.appStoreUrl}  onChange={(v) => set("appStoreUrl", v)}  placeholder="https://apps.apple.com/…"  />
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[var(--foreground)]">Team Members</p>
          <button onClick={addTeamMember} className="flex items-center gap-1.5 rounded-lg bg-[var(--gold)]/15 px-3 py-1.5 text-xs font-bold text-[var(--gold)] hover:bg-[var(--gold)]/25 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Member
          </button>
        </div>
        <div className="space-y-3">
          {form.teamMembers.map((m, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
              <div className="flex items-center gap-2">
                {m.photo ? (
                  <img src={m.photo} alt={m.name} className="h-10 w-10 rounded-full object-cover ring-1 ring-[var(--gold)]/30 shrink-0" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/15 text-xs font-bold text-[var(--gold)]">
                    {m.name ? m.name[0].toUpperCase() : "?"}
                  </div>
                )}
                <input
                  value={m.name}
                  onChange={(e) => updateTeamMember(i, "name", e.target.value)}
                  placeholder="Full Name"
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:border-[var(--gold)]"
                />
                <input
                  value={m.role}
                  onChange={(e) => updateTeamMember(i, "role", e.target.value)}
                  placeholder="Role"
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:border-[var(--gold)]"
                />
                <button onClick={() => removeTeamMember(i)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={m.photo ?? ""}
                  onChange={(e) => updateTeamMember(i, "photo", e.target.value)}
                  placeholder="Photo URL or click Upload →"
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:border-[var(--gold)]"
                />
                <label
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
                    uploading[i] ? "bg-[var(--gold)]/5 text-[var(--muted-foreground)]" : "bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)]/20"
                  }`}
                >
                  <ImageUp className="h-3.5 w-3.5" />
                  {uploading[i] ? "Uploading…" : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => { fileInputRefs.current[i] = el; }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(i, f); }}
                    disabled={uploading[i]}
                  />
                </label>
              </div>
            </div>
          ))}
          {form.teamMembers.length === 0 && <p className="text-xs text-[var(--muted-foreground)]">No team members added yet.</p>}
        </div>
      </div>

      {/* Social links */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[var(--foreground)]">Social Links</p>
          <button onClick={addSocialLink} className="flex items-center gap-1.5 rounded-lg bg-[var(--gold)]/15 px-3 py-1.5 text-xs font-bold text-[var(--gold)] hover:bg-[var(--gold)]/25 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Link
          </button>
        </div>
        <div className="space-y-2">
          {form.socialLinks.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={l.platform}
                onChange={(e) => updateSocialLink(i, "platform", e.target.value)}
                placeholder="Platform (Twitter, YouTube…)"
                className="w-36 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:border-[var(--gold)]"
              />
              <input
                value={l.url}
                onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                placeholder="URL"
                className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:border-[var(--gold)]"
              />
              <button onClick={() => removeSocialLink(i)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {form.socialLinks.length === 0 && <p className="text-xs text-[var(--muted-foreground)]">No social links added yet.</p>}
        </div>
      </div>
    </div>
  );
}

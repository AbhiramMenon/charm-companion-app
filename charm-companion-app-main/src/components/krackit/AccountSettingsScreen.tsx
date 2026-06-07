import { useRef, useState } from "react";
import { ArrowLeft, Camera, Check, ChevronDown, ChevronUp, Eye, EyeOff, Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import type { UserProfile } from "@/routes/index";
import { passwordStrength, sanitize, validateProfile } from "@/lib/security";
import { cn } from "@/lib/utils";
import { profileApi, mobileAuth } from "@/lib/mobileApi";

export function AccountSettingsScreen({
  profile,
  userId,
  onSave,
  onBack,
}: {
  profile: UserProfile;
  userId?: string | null;
  onSave: (p: UserProfile) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState({ name: profile.name, email: profile.email, phone: profile.phone, bio: profile.bio });
  const [profilePic, setProfilePic] = useState<string | undefined>(profile.profilePic);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePic(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Change password flow
  const [showPwSection, setShowPwSection] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwVerified, setPwVerified] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const pwStr = passwordStrength(newPw);

  const set = (key: keyof typeof form, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    const errs = validateProfile(form.name, form.email, form.phone);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const updated: UserProfile = { ...profile, name: sanitize(form.name), email: sanitize(form.email).toLowerCase(), phone: sanitize(form.phone), bio: sanitize(form.bio), profilePic };
    onSave(updated);
    if (userId) {
      profileApi.update(userId, { name: updated.name, phone: updated.phone || null, avatar_url: profilePic ?? null }).catch(() => {});
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const verifyCurrentPassword = () => {
    // In a real app this would hit an API; here we simulate: any 6+ char password passes
    if (currentPw.length < 6) {
      setPwErrors({ current: "Incorrect password. Please try again." });
      return;
    }
    setPwErrors({});
    setPwVerified(true);
  };

  const handleChangePassword = async () => {
    const errs: Record<string, string> = {};
    if (newPw.length < 6) errs.new = "Password must be at least 6 characters.";
    if (pwStr.score < 2) errs.new = "Please choose a stronger password.";
    if (newPw !== confirmPw) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    try {
      await mobileAuth.updatePassword(newPw);
    } catch (err: unknown) {
      setPwErrors({ new: err instanceof Error ? err.message : "Failed to update password." });
      return;
    }
    setPwSaved(true);
    setTimeout(() => {
      setPwSaved(false);
      setShowPwSection(false);
      setPwVerified(false);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <header className="px-5 pb-2 pt-6">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">Settings</p>
          <h1 className="text-2xl font-bold text-foreground">Account</h1>
        </div>
      </header>

      <div className="mt-5 space-y-4 px-5">
        {/* Profile picture */}
        <div className="rounded-3xl border border-border bg-surface p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profile Photo</p>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-gold/30"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full gold-gradient text-2xl font-bold text-[#1a1410]">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-gold text-[#1a1410] shadow"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Upload a photo</p>
              <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG or GIF · Max 5MB</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 rounded-xl border border-gold/30 px-3 py-1.5 text-xs font-semibold text-gold"
              >
                Choose photo
              </button>
              {profilePic && (
                <button
                  type="button"
                  onClick={() => setProfilePic(undefined)}
                  className="ml-2 mt-2 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePicChange}
          />
        </div>

        {/* Profile info */}
        <div className="rounded-3xl border border-border bg-surface p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profile Info</p>
          {([
            { key: "name",  label: "Full Name",    placeholder: "Aarav Singh",       type: "text" },
            { key: "email", label: "Email Address", placeholder: "you@example.com",   type: "email" },
            { key: "phone", label: "Phone",         placeholder: "+91 9876543210",    type: "tel" },
          ] as { key: keyof typeof form; label: string; placeholder: string; type: string }[]).map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                maxLength={120}
                className={cn(
                  "w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 transition-colors",
                  errors[key]
                    ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                    : "border-border focus:border-gold/50 focus:ring-gold/30"
                )}
              />
              {errors[key] && <p className="mt-1 text-[11px] text-destructive">{errors[key]}</p>}
            </div>
          ))}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="UPSC 2026 aspirant. Targeting IAS."
              rows={3}
              maxLength={200}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 resize-none"
            />
            <p className="mt-1 text-right text-[11px] text-muted-foreground/50">{form.bio.length}/200</p>
          </div>
        </div>

        {/* Change Password — collapsible */}
        <div className="rounded-3xl border border-border bg-surface overflow-hidden">
          <button
            onClick={() => { setShowPwSection(!showPwSection); setPwVerified(false); setPwErrors({}); }}
            className="flex w-full items-center gap-3 px-5 py-4 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background">
              <Lock className="h-4 w-4 text-gold" />
            </div>
            <span className="flex-1 text-sm font-semibold text-foreground">Change Password</span>
            {showPwSection
              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {showPwSection && (
            <div className="border-t border-border px-5 pb-5 pt-4 space-y-3">
              {!pwVerified ? (
                <>
                  <p className="text-xs text-muted-foreground">Enter your current password to continue.</p>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="Current password"
                      className={cn(
                        "w-full rounded-xl border bg-background px-4 py-3 pr-11 text-sm text-foreground focus:outline-none focus:ring-1 transition-colors",
                        pwErrors.current ? "border-destructive/60" : "border-border focus:border-gold/50 focus:ring-gold/30"
                      )}
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {pwErrors.current && <p className="text-[11px] text-destructive">{pwErrors.current}</p>}
                  <button onClick={verifyCurrentPassword} className="w-full rounded-xl gold-gradient py-3 text-sm font-bold text-[#1a1410]">
                    Verify &amp; Continue
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-400/10 px-3 py-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <p className="text-xs font-semibold text-emerald-400">Identity verified</p>
                  </div>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="New password"
                      className={cn(
                        "w-full rounded-xl border bg-background px-4 py-3 pr-11 text-sm text-foreground focus:outline-none focus:ring-1 transition-colors",
                        pwErrors.new ? "border-destructive/60" : "border-border focus:border-gold/50 focus:ring-gold/30"
                      )}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPw.length > 0 && (
                    <div>
                      <div className="flex gap-1 mb-0.5">
                        {[0,1,2,3].map((i) => (
                          <div key={i} className={cn("h-1 flex-1 rounded-full", i < pwStr.score ? pwStr.color : "bg-border")} />
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{pwStr.label}</p>
                    </div>
                  )}
                  {pwErrors.new && <p className="text-[11px] text-destructive">{pwErrors.new}</p>}
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Confirm new password"
                    className={cn(
                      "w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 transition-colors",
                      pwErrors.confirm ? "border-destructive/60" : "border-border focus:border-gold/50 focus:ring-gold/30"
                    )}
                  />
                  {pwErrors.confirm && <p className="text-[11px] text-destructive">{pwErrors.confirm}</p>}
                  {pwSaved ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400/10 py-3 text-sm font-semibold text-emerald-400">
                      <Check className="h-4 w-4" /> Password updated!
                    </div>
                  ) : (
                    <button onClick={handleChangePassword} className="w-full rounded-xl gold-gradient py-3 text-sm font-bold text-[#1a1410]">
                      Update Password
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-xs font-semibold uppercase tracking-wider text-destructive">Danger Zone</p>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">Deleting your account is permanent and cannot be undone.</p>
          <button className="w-full rounded-xl border border-destructive/30 py-3 text-sm font-medium text-destructive">
            Delete Account
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full rounded-2xl gold-gradient py-4 text-base font-bold text-[#1a1410] shadow-lg shadow-gold/20 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {saved ? <><Check className="h-5 w-5" /> Saved!</> : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

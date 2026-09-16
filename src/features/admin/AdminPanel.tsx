"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
const logoImg = "/Mlogo.png";
import { useAdmin, type NewAdminService } from "@/app/context/AdminContext";
import { supabase } from "@/lib/supabase";
import { Field, ICON_CHOICES, ImageDropzone, Modal } from "./shared";
import DashboardPanel from "./DashboardPanel";
import ServicesPanel from "./ServicesPanel";
import ServiceEditorPanel from "./ServiceEditorPanel";
import TestimonialsPanel from "./TestimonialsPanel";
import WebsiteImagesPanel from "./WebsiteImagesPanel";
import MembersPanel from "./MembersPanel";
import SettingsPanel from "./SettingsPanel";

type Tab =
  | "dashboard"
  | "services"
  | "service-editor"
  | "testimonials"
  | "images"
  | "members"
  | "settings";

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "services", icon: "🛠️", label: "Products" },
  { id: "testimonials", icon: "💬", label: "Testimonials" },
  { id: "images", icon: "🖼️", label: "Website Images" },
  { id: "members", icon: "👥", label: "Members" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

function NewServiceForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (service: NewAdminService) => void;
}) {
  const [icon, setIcon] = useState("✨");
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [status, setStatus] = useState<NewAdminService["status"]>("active");

  return (
    <Modal title="Add a product" onClose={onCancel} wide>
      <p className="text-sm text-muted-foreground -mt-3 mb-5">
        Every product page uses the same template — fill in the same fields the
        editor uses, then add images, features and testimonials afterward.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onCreate({
            icon,
            title,
            label: label || title.toUpperCase(),
            heading: heading || title,
            description,
            heroImage,
            images: [],
            features: [],
            status,
          });
        }}
        className="space-y-4"
      >
        <Field label="Icon">
          <div className="flex flex-wrap gap-1.5">
            {ICON_CHOICES.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setIcon(choice)}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-colors ${icon === choice ? "border-accent bg-secondary" : "border-border hover:bg-secondary/60"}`}
              >
                {choice}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Product Name *">
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="admin-input"
              placeholder="e.g. Business Analytics"
            />
          </Field>
          <Field
            label="Small Label (Top Text)"
            hint="Shown above the main heading"
          >
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="admin-input"
              placeholder="e.g. BUSINESS ANALYTICS"
            />
          </Field>
        </div>
        <Field
          label="Main Heading"
          hint="The big headline at the top of the page"
        >
          <input
            value={heading}
            onChange={(event) => setHeading(event.target.value)}
            className="admin-input"
            placeholder="e.g. Make Smarter Decisions Faster"
          />
        </Field>
        <Field label="Description *">
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="admin-input resize-none"
            placeholder="What does this product provide?"
          />
        </Field>
        <Field label="Hero / Profile Image">
          <ImageDropzone value={heroImage} onChange={setHeroImage} />
          <input
            value={heroImage}
            onChange={(e) => setHeroImage(e.target.value)}
            className="admin-input mt-2"
            placeholder="Or paste an image URL"
          />
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as NewAdminService["status"])
            }
            className="admin-input"
          >
            <option value="active">Published</option>
            <option value="coming_soon">Coming soon</option>
          </select>
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold text-white"
          >
            Create product
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminPanel() {
  const {
    services,
    testimonials,
    websiteImages,
    members,
    adminPassword,
    addService,
    syncContent,
  } = useAdmin();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("admin@leafclutchtech.com");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [servicesExpanded, setServicesExpanded] = useState(true);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newServiceOpen, setNewServiceOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setAuthenticated(Boolean(data.session));
    };

    void checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError || !data.user) {
        if (password === adminPassword) {
          setAuthenticated(true);
          return;
        }
        setError("Incorrect email or password.");
        return;
      }

      setAuthenticated(true);
      setError("");
      await syncContent();
    } catch {
      if (password === adminPassword) {
        setAuthenticated(true);
        return;
      }
      setError("Incorrect email or password.");
    }
  };

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const results: {
      key: string;
      label: string;
      sub: string;
      onSelect: () => void;
    }[] = [];
    services.forEach((s) => {
      if (s.title.toLowerCase().includes(q))
        results.push({
          key: `s-${s.id}`,
          label: s.title,
          sub: "Product",
          onSelect: () => {
            setEditingServiceId(s.id);
            setTab("service-editor");
            setSearch("");
          },
        });
    });
    testimonials.forEach((t) => {
      if (
        t.name.toLowerCase().includes(q) ||
        t.company.toLowerCase().includes(q)
      )
        results.push({
          key: `t-${t.id}`,
          label: t.name,
          sub: `Testimonial · ${t.company}`,
          onSelect: () => {
            setTab("testimonials");
            setSearch("");
          },
        });
    });
    websiteImages.forEach((i) => {
      if (i.name.toLowerCase().includes(q))
        results.push({
          key: `i-${i.id}`,
          label: i.name,
          sub: "Website image",
          onSelect: () => {
            setTab("images");
            setSearch("");
          },
        });
    });
    members.forEach((m) => {
      if (m.name.toLowerCase().includes(q))
        results.push({
          key: `m-${m.id}`,
          label: m.name,
          sub: "Member",
          onSelect: () => {
            setTab("members");
            setSearch("");
          },
        });
    });
    return results.slice(0, 8);
  }, [search, services, testimonials, websiteImages, members]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0F1729] hero-grid flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-cyan-400 to-[#072069] flex items-center justify-center text-white text-2xl mx-auto mb-4">
              🔐
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Leafclutch Technology
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@leafclutchtech.com"
                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-accent"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full btn-primary text-white font-semibold py-3 rounded-xl text-sm"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const goTab = (next: Tab) => {
    setTab(next);
    if (next !== "service-editor") setEditingServiceId(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 min-h-screen bg-[#0F1729] text-white flex flex-col">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <Image
            src={logoImg}
            alt="Leafclutch Technology"
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg object-contain bg-white/5 p-1"
          />
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">Leafclutch Technology</p>
            <p className="text-gray-400 text-[11px]">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => {
                  if (item.id === "services") {
                    setServicesExpanded((v) => !v);
                    goTab("services");
                  } else goTab(item.id);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  tab === item.id ||
                  (item.id === "services" && tab === "service-editor")
                    ? "bg-white/10 text-[#3BE3A0]"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
                {item.id === "services" && (
                  <span className="ml-auto text-[10px]">
                    {servicesExpanded ? "▾" : "▸"}
                  </span>
                )}
              </button>
              {item.id === "services" && servicesExpanded && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                  <button
                    type="button"
                    onClick={() => goTab("services")}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${tab === "services" ? "text-[#3BE3A0]" : "text-gray-400 hover:text-white"}`}
                  >
                    All Products
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewServiceOpen(true)}
                    className="block w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    + Add New Product
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-sm font-bold text-white">
            Keep Your Website Always Updated
          </p>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            Manage content, images and client stories with ease.
          </p>
        </div>
        <p className="text-[11px] text-gray-500 text-center pb-4">
          © {new Date().getFullYear()} Leafclutch Technology · Admin Panel
        </p>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-border px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, testimonials, images…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:border-accent bg-[#F8FAFC]"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              🔍
            </span>
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-30">
                {searchResults.map((result) => (
                  <button
                    key={result.key}
                    type="button"
                    onClick={result.onSelect}
                    className="w-full text-left px-4 py-2.5 hover:bg-secondary transition-colors border-b border-[#F3F4F7] last:border-0"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {result.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.sub}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/"
              className="text-muted-foreground hover:text-accent text-sm transition-colors"
            >
              ← Back to Site
            </Link>
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-cyan-400 to-[#072069] flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setAuthenticated(false);
              }}
              className="text-muted-foreground hover:text-red-500 text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-[1400px] w-full">
          {tab === "dashboard" && (
            <DashboardPanel
              onNavigate={(next) =>
                goTab(
                  next === "services"
                    ? "services"
                    : next === "testimonials"
                      ? "testimonials"
                      : "images",
                )
              }
            />
          )}
          {tab === "services" && (
            <ServicesPanel
              onEdit={(id) => {
                setEditingServiceId(id);
                setTab("service-editor");
              }}
              onAddNew={() => setNewServiceOpen(true)}
            />
          )}
          {tab === "service-editor" && editingServiceId && (
            <ServiceEditorPanel
              serviceId={editingServiceId}
              onBack={() => goTab("services")}
            />
          )}
          {tab === "testimonials" && <TestimonialsPanel />}
          {tab === "images" && <WebsiteImagesPanel />}
          {tab === "members" && <MembersPanel />}
          {tab === "settings" && <SettingsPanel />}
        </main>
      </div>

      {newServiceOpen && (
        <NewServiceForm
          onCancel={() => setNewServiceOpen(false)}
          onCreate={(service) => {
            const id = addService(service);
            setEditingServiceId(id);
            setTab("service-editor");
            setNewServiceOpen(false);
          }}
        />
      )}
    </div>
  );
}

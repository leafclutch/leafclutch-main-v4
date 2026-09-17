"use client";

import { useState } from "react";
import { useAdmin, type CompanyService } from "@/app/context/AdminContext";
import { Field, ImageDropzone, StatusPill } from "./shared";

export default function CompanyServiceEditorPanel({
  serviceId,
  onBack,
}: {
  serviceId: string;
  onBack: () => void;
}) {
  const { companyServices, updateCompanyService } = useAdmin();
  const service = companyServices.find((s) => s.id === serviceId);

  const [title, setTitle] = useState(service?.title ?? "");
  const [icon, setIcon] = useState(service?.icon ?? "💼");
  const [shortDescription, setShortDescription] = useState(
    service?.shortDescription ?? "",
  );
  const [fullDescription, setFullDescription] = useState(
    service?.fullDescription ?? "",
  );
  const [coverImage, setCoverImage] = useState(service?.coverImage ?? "");
  const [status, setStatus] = useState<"active" | "draft">(
    service?.status ?? "active",
  );

  const [features, setFeatures] = useState<string[]>(service?.features ?? []);
  const [newFeature, setNewFeature] = useState("");

  const [benefits, setBenefits] = useState<string[]>(service?.benefits ?? []);
  const [newBenefit, setNewBenefit] = useState("");

  const [technologies, setTechnologies] = useState<string[]>(
    service?.technologies ?? [],
  );
  const [newTech, setNewTech] = useState("");

  const [savedMessage, setSavedMessage] = useState(false);

  if (!service) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-border">
        <p className="text-lg font-bold text-foreground">Service not found</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 btn-primary text-white text-sm font-semibold px-4 py-2 rounded-xl"
        >
          Back to Services
        </button>
      </div>
    );
  }

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateCompanyService(service.id, {
      title,
      icon,
      shortDescription,
      fullDescription,
      coverImage: coverImage || undefined,
      features,
      benefits,
      technologies,
      status,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const addFeatureItem = () => {
    if (!newFeature.trim()) return;
    setFeatures((prev) => [...prev, newFeature.trim()]);
    setNewFeature("");
  };

  const removeFeatureItem = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const addBenefitItem = () => {
    if (!newBenefit.trim()) return;
    setBenefits((prev) => [...prev, newBenefit.trim()]);
    setNewBenefit("");
  };

  const removeBenefitItem = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  const addTechItem = () => {
    if (!newTech.trim()) return;
    setTechnologies((prev) => [...prev, newTech.trim()]);
    setNewTech("");
  };

  const removeTechItem = (index: number) => {
    setTechnologies((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header with back button & save action */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>←</span> Back to Services
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-bold text-foreground truncate max-w-xs">
            {service.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {savedMessage && (
            <span className="text-xs font-semibold text-green-600 animate-fade-in">
              ✓ Changes saved successfully
            </span>
          )}
          <button
            type="button"
            onClick={() => handleSave()}
            className="btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl inline-flex items-center gap-2"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
            <h3 className="font-bold text-foreground text-base border-b border-border pb-3">
              General Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <Field label="Icon Emoji">
                  <input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="admin-input text-center text-xl"
                    placeholder="💼"
                    maxLength={4}
                  />
                </Field>
              </div>
              <div className="sm:col-span-3">
                <Field label="Service Title *">
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="admin-input font-semibold"
                    placeholder="e.g. Software Development"
                  />
                </Field>
              </div>
            </div>

            <Field
              label="Short Summary / Tagline *"
              hint="Shown in service listings, hover cards, and mega menus"
            >
              <textarea
                required
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="admin-input resize-none"
                placeholder="Brief summary..."
              />
            </Field>

            <Field
              label="Full Description"
              hint="Detailed narrative shown on the dedicated service detail page"
            >
              <textarea
                rows={4}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="admin-input"
                placeholder="Describe this service in full..."
              />
            </Field>

            <Field label="Cover Image">
              <ImageDropzone value={coverImage} onChange={setCoverImage} />
              <input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="admin-input mt-2"
                placeholder="Or paste an image URL"
              />
            </Field>
          </div>

          {/* Features / Deliverables */}
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div>
              <h3 className="font-bold text-foreground text-base">
                Key Deliverables & Features
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Specific items clients receive when engaging this service.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeatureItem();
                  }
                }}
                className="admin-input flex-1"
                placeholder="e.g. Custom Enterprise Architecture"
              />
              <button
                type="button"
                onClick={addFeatureItem}
                className="rounded-xl bg-[#072069] text-white text-xs font-semibold px-4 py-2"
              >
                + Add
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#F8FAFC] border border-border text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9]" />
                    {feat}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFeatureItem(idx)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-0.5"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {features.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No features added yet.
                </p>
              )}
            </div>
          </div>

          {/* Key Benefits */}
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div>
              <h3 className="font-bold text-foreground text-base">
                Client Benefits
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Why a business should choose Leafclutch for this service.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addBenefitItem();
                  }
                }}
                className="admin-input flex-1"
                placeholder="e.g. Automate repetitive business workflows"
              />
              <button
                type="button"
                onClick={addBenefitItem}
                className="rounded-xl bg-[#072069] text-white text-xs font-semibold px-4 py-2"
              >
                + Add
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {benefits.map((ben, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#F8FAFC] border border-border text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3BE3A0]" />
                    {ben}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeBenefitItem(idx)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-0.5"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {benefits.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No benefits added yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Status, Technologies & Meta */}
        <div className="space-y-6">
          {/* Status card */}
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <h3 className="font-bold text-foreground text-base border-b border-border pb-3">
              Publishing Settings
            </h3>
            <Field label="Status">
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "active" | "draft")
                }
                className="admin-input"
              >
                <option value="active">Active (Visible)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </Field>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground">Unique Slug / ID:</p>
              <p className="text-xs font-mono bg-secondary px-2.5 py-1.5 rounded-lg mt-1 text-foreground">
                {service.id}
              </p>
            </div>
          </div>

          {/* Technologies & Tools */}
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div>
              <h3 className="font-bold text-foreground text-base">
                Technologies & Tools
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Frameworks, languages, or software used.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTechItem();
                  }
                }}
                className="admin-input flex-1"
                placeholder="e.g. Next.js, Figma"
              />
              <button
                type="button"
                onClick={addTechItem}
                className="rounded-xl bg-[#072069] text-white text-xs font-semibold px-3 py-1.5"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary text-foreground text-xs font-medium rounded-lg"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechItem(idx)}
                    className="text-muted-foreground hover:text-red-500 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
              {technologies.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No technologies added.
                </p>
              )}
            </div>
          </div>

          {/* Live Preview Links */}
          <div className="bg-[#EEF4FF] rounded-2xl p-5 border border-[#CCDDFB] space-y-3">
            <h4 className="font-bold text-[#072069] text-sm">
              Public Web Link
            </h4>
            <p className="text-xs text-[#676F7E] leading-relaxed">
              This service is accessible on the public website at:
            </p>
            <a
              href={`/services/${service.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0EA5E9] hover:underline"
            >
              /services/{service.id} ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

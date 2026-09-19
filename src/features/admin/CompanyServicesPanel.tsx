"use client";

import { useState } from "react";
import {
  useAdmin,
  type CompanyService,
  type NewCompanyService,
} from "@/app/context/AdminContext";
import {
  ConfirmDialog,
  Field,
  ICON_CHOICES,
  ImageDropzone,
  Modal,
  StatusPill,
  relativeTime,
} from "./shared";

function NewCompanyServiceModal({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (service: NewCompanyService) => void;
}) {
  const [icon, setIcon] = useState("💼");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<"active" | "draft">("active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      title,
      icon,
      shortDescription,
      fullDescription: fullDescription || shortDescription,
      coverImage: coverImage || undefined,
      features: [],
      benefits: [],
      technologies: [],
      status,
    });
  };

  return (
    <Modal title="Add New Service" onClose={onCancel} wide>
      <p className="text-sm text-muted-foreground -mt-3 mb-5">
        Create a new corporate service. You can customize features, benefits,
        and technologies afterward in the service editor.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Service Icon">
          <div className="flex flex-wrap gap-1.5">
            {[
              "💼",
              "💻",
              "🌐",
              "📣",
              "🎓",
              "🎨",
              "🎬",
              "📈",
              "✣",
              "⚡",
              "🛡️",
              "🤖",
              "📱",
              "☁️",
            ].map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setIcon(choice)}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-colors ${
                  icon === choice
                    ? "border-accent bg-secondary"
                    : "border-border hover:bg-secondary/60"
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Service Name *">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="admin-input"
            placeholder="e.g. AI & Automation Solutions"
          />
        </Field>

        <Field
          label="Short Description *"
          hint="Displayed on cards, previews, and mega dropdowns"
        >
          <textarea
            required
            rows={2}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="admin-input resize-none"
            placeholder="Brief 1-2 sentence overview of this service..."
          />
        </Field>

        <Field
          label="Full Description"
          hint="Detailed overview shown on the service detail page"
        >
          <textarea
            rows={3}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            className="admin-input resize-none"
            placeholder="Detailed narrative describing how Leafclutch delivers this service..."
          />
        </Field>

        <Field label="Cover Image">
          <ImageDropzone value={coverImage} onChange={setCoverImage} folder="services" />
          <input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="admin-input mt-2"
            placeholder="Or paste an image URL"
          />
        </Field>

        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "draft")}
            className="admin-input"
          >
            <option value="active">Active (Visible)</option>
            <option value="draft">Draft (Hidden)</option>
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
            Create Service
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function CompanyServicesPanel({
  onEdit,
  onAddNew,
}: {
  onEdit: (id: string) => void;
  onAddNew: () => void;
}) {
  const {
    companyServices,
    deleteCompanyService,
    reorderCompanyService,
    addCompanyService,
  } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedServices = [...companyServices].sort((a, b) => a.order - b.order);
  const targetServiceToDelete = companyServices.find(
    (s) => s.id === deletingId,
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">
            Services Management
          </p>
          <h2 className="text-2xl font-bold text-foreground mt-1">
            Our Services
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage company services (Software Development, Digital Marketing,
            SEO, UI/UX, etc.) displayed on the website and navigation.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl inline-flex items-center gap-2"
        >
          <span>+</span> Add New Service
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border bg-[#F8FAFC]">
                <th className="px-4 py-3 font-semibold w-16 text-center">
                  Order
                </th>
                <th className="px-4 py-3 font-semibold">Service Name</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">
                  Technologies
                </th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">
                  Last Updated
                </th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedServices.map((service, index) => (
                <tr
                  key={service.id}
                  className="border-b border-[#F3F4F7] last:border-0 hover:bg-[#F8FAFC] transition-colors"
                >
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => reorderCompanyService(service.id, "up")}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          index === 0
                            ? "text-gray-300"
                            : "text-gray-600 hover:bg-gray-200"
                        }`}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <span className="text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        disabled={index === sortedServices.length - 1}
                        onClick={() =>
                          reorderCompanyService(service.id, "down")
                        }
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          index === sortedServices.length - 1
                            ? "text-gray-300"
                            : "text-gray-600 hover:bg-gray-200"
                        }`}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {service.coverImage ? (
                        <img
                          src={service.coverImage}
                          alt=""
                          className="w-11 h-11 rounded-lg object-cover shrink-0 bg-secondary"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg shrink-0 bg-[#EBF0FA] flex items-center justify-center text-xl">
                          {service.icon}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {service.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {service.shortDescription}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {service.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] px-2 py-0.5 bg-secondary text-foreground rounded-md font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {service.technologies.length > 3 && (
                        <span className="text-[10px] text-muted-foreground self-center">
                          +{service.technologies.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <StatusPill
                      active={service.status === "active"}
                      activeLabel="Active"
                      inactiveLabel="Draft"
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs hidden sm:table-cell">
                    {relativeTime(service.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(service.id)}
                        className="text-accent hover:text-[#072069] text-xs font-semibold border border-accent/30 hover:border-accent rounded-lg px-3 py-1.5 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(service.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold border border-red-200 hover:border-red-400 rounded-lg px-2.5 py-1.5 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <NewCompanyServiceModal
          onCancel={() => setModalOpen(false)}
          onCreate={(newService) => {
            const id = addCompanyService(newService);
            setModalOpen(false);
            onEdit(id);
          }}
        />
      )}

      {deletingId && targetServiceToDelete && (
        <ConfirmDialog
          title={`Delete "${targetServiceToDelete.title}"?`}
          description="Are you sure you want to delete this service? It will no longer appear on the website or navigation menu."
          confirmLabel="Delete Service"
          onCancel={() => setDeletingId(null)}
          onConfirm={() => {
            deleteCompanyService(deletingId);
            setDeletingId(null);
          }}
        />
      )}
    </div>
  );
}

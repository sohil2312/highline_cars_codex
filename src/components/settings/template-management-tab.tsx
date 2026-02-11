"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { defaultChecklist } from "@/lib/templates";
import type { ChecklistCategory } from "@/lib/types";

interface Template {
  id: string;
  name: string;
  version: number;
  is_default: boolean;
  categories: ChecklistCategory[];
  created_at: string;
}

export function TemplateManagementTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("checklist_templates")
      .select("*")
      .order("created_at", { ascending: false });
    setTemplates((data as Template[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const createFromDefault = async () => {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("checklist_templates").insert({
      name: `Custom Template ${templates.length + 1}`,
      version: 1,
      is_default: false,
      categories: defaultChecklist,
      created_by: auth.user?.id,
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Template created from default.");
    loadTemplates();
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    const supabase = createClient();
    await supabase.from("checklist_templates").delete().eq("id", id);
    setMessage("Template deleted.");
    if (editing?.id === id) setEditing(null);
    loadTemplates();
  };

  const saveTemplate = async (template: Template) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("checklist_templates")
      .update({
        name: template.name,
        categories: template.categories,
        version: template.version + 1,
      })
      .eq("id", template.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Template saved.");
    setEditing(null);
    loadTemplates();
  };

  if (loading) return <p className="text-sm text-neutral-500">Loading templates...</p>;

  if (editing) {
    return (
      <TemplateEditor
        template={editing}
        onSave={saveTemplate}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {message && <Card className="p-3 text-sm">{message}</Card>}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Checklist Templates</p>
          <p className="text-xs text-neutral-500">
            Clone the default template to create custom checklists.
          </p>
        </div>
        <Button onClick={createFromDefault}>Clone Default</Button>
      </div>

      {/* Default template (read-only) */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Default Template</p>
            <p className="text-xs text-neutral-500">
              {defaultChecklist.length} categories, {defaultChecklist.reduce((s, c) => s + c.items.length, 0)} items
            </p>
          </div>
          <span className="text-xs brutal-border px-2 py-1">Built-in</span>
        </div>
      </Card>

      {/* Custom templates */}
      {templates.map((t) => (
        <Card key={t.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-neutral-500">
                v{t.version} &bull; {t.categories.length} categories,{" "}
                {t.categories.reduce((s, c) => s + c.items.length, 0)} items
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(t)}>
                Edit
              </Button>
              {!t.is_default && (
                <Button size="sm" variant="outline" onClick={() => deleteTemplate(t.id)}>
                  Delete
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}

      {templates.length === 0 && (
        <p className="text-sm text-neutral-500">No custom templates yet. Clone the default to get started.</p>
      )}
    </div>
  );
}

// ─── Template Editor ──────────────────────────────────────────────────────────

function TemplateEditor({
  template,
  onSave,
  onCancel,
}: {
  template: Template;
  onSave: (t: Template) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(template.name);
  const [categories, setCategories] = useState<ChecklistCategory[]>(
    JSON.parse(JSON.stringify(template.categories))
  );
  const [newCatName, setNewCatName] = useState("");

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const id = newCatName.trim().toLowerCase().replace(/\s+/g, "-");
    setCategories([...categories, { id, title: newCatName.trim(), items: [] }]);
    setNewCatName("");
  };

  const removeCategory = (idx: number) => {
    if (!confirm("Remove this category and all its items?")) return;
    setCategories(categories.filter((_, i) => i !== idx));
  };

  const moveCategoryUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...categories];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setCategories(next);
  };

  const moveCategoryDown = (idx: number) => {
    if (idx === categories.length - 1) return;
    const next = [...categories];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setCategories(next);
  };

  const addItem = (catIdx: number) => {
    const label = prompt("Item label:");
    if (!label) return;
    const id = label.trim().toLowerCase().replace(/\s+/g, "-");
    const next = [...categories];
    next[catIdx] = {
      ...next[catIdx],
      items: [...next[catIdx].items, { id, label: label.trim(), itemType: "GENERAL" }],
    };
    setCategories(next);
  };

  const removeItem = (catIdx: number, itemIdx: number) => {
    const next = [...categories];
    next[catIdx] = {
      ...next[catIdx],
      items: next[catIdx].items.filter((_, i) => i !== itemIdx),
    };
    setCategories(next);
  };

  const moveItemUp = (catIdx: number, itemIdx: number) => {
    if (itemIdx === 0) return;
    const next = [...categories];
    const items = [...next[catIdx].items];
    [items[itemIdx - 1], items[itemIdx]] = [items[itemIdx], items[itemIdx - 1]];
    next[catIdx] = { ...next[catIdx], items };
    setCategories(next);
  };

  const moveItemDown = (catIdx: number, itemIdx: number) => {
    if (itemIdx === categories[catIdx].items.length - 1) return;
    const next = [...categories];
    const items = [...next[catIdx].items];
    [items[itemIdx], items[itemIdx + 1]] = [items[itemIdx + 1], items[itemIdx]];
    next[catIdx] = { ...next[catIdx], items };
    setCategories(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onCancel}>
            Back
          </Button>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-64"
            placeholder="Template name"
          />
        </div>
        <Button onClick={() => onSave({ ...template, name, categories })}>
          Save Template
        </Button>
      </div>

      {categories.map((cat, catIdx) => (
        <Card key={cat.id} className="p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">{cat.title}</p>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => moveCategoryUp(catIdx)}>
                &uarr;
              </Button>
              <Button size="sm" variant="outline" onClick={() => moveCategoryDown(catIdx)}>
                &darr;
              </Button>
              <Button size="sm" variant="outline" onClick={() => addItem(catIdx)}>
                + Item
              </Button>
              <Button size="sm" variant="outline" onClick={() => removeCategory(catIdx)}>
                Remove
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            {cat.items.map((item, itemIdx) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs brutal-border p-2"
              >
                <span>
                  {item.label}{" "}
                  <span className="text-neutral-400">({item.itemType})</span>
                </span>
                <div className="flex gap-1">
                  <button
                    className="px-1 text-neutral-500 hover:text-black"
                    onClick={() => moveItemUp(catIdx, itemIdx)}
                  >
                    &uarr;
                  </button>
                  <button
                    className="px-1 text-neutral-500 hover:text-black"
                    onClick={() => moveItemDown(catIdx, itemIdx)}
                  >
                    &darr;
                  </button>
                  <button
                    className="px-1 text-red-500 hover:text-red-700"
                    onClick={() => removeItem(catIdx, itemIdx)}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
            {cat.items.length === 0 && (
              <p className="text-xs text-neutral-400 py-1">No items. Click + Item to add.</p>
            )}
          </div>
        </Card>
      ))}

      {/* Add new category */}
      <div className="flex items-center gap-2">
        <Input
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="New category name"
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
        />
        <Button variant="outline" onClick={addCategory}>
          Add Category
        </Button>
      </div>
    </div>
  );
}

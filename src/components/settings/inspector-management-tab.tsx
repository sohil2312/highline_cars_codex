"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Inspector {
  id: string;
  full_name: string | null;
  role: string;
  email?: string;
}

export function InspectorManagementTab() {
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const loadInspectors = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .order("created_at", { ascending: true });
    setInspectors(data ?? []);
  };

  useEffect(() => {
    loadInspectors();
  }, []);

  const addInspector = async () => {
    if (!newEmail || !newPassword) {
      setMessage("Email and password are required.");
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings/inspectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          full_name: newName || null
        })
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error ?? "Failed to create inspector.");
      } else {
        setMessage("Inspector created.");
        setNewEmail("");
        setNewPassword("");
        setNewName("");
        setShowAdd(false);
        await loadInspectors();
      }
    } catch {
      setMessage("Network error.");
    }
    setLoading(false);
  };

  const saveEditName = async (id: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings/inspectors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, full_name: editName })
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error ?? "Failed to update.");
      } else {
        setMessage("Updated.");
        setEditingId(null);
        await loadInspectors();
      }
    } catch {
      setMessage("Network error.");
    }
    setLoading(false);
  };

  const deactivateInspector = async (id: string) => {
    if (!confirm("Deactivate this inspector? They will no longer be able to log in.")) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings/inspectors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error ?? "Failed to deactivate.");
      } else {
        setMessage("Inspector deactivated.");
        await loadInspectors();
      }
    } catch {
      setMessage("Network error.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Inspectors ({inspectors.length})</p>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Cancel" : "Add Inspector"}
        </Button>
      </div>

      {showAdd && (
        <div className="brutal-border p-4 space-y-3 bg-neutral-50">
          <div>
            <label className="text-xs font-medium">Email</label>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="inspector@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Temporary password"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Full Name (optional)</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Inspector name"
            />
          </div>
          <Button onClick={addInspector} disabled={loading}>
            {loading ? "Creating..." : "Create Inspector"}
          </Button>
        </div>
      )}

      {message && <p className="text-xs text-neutral-600">{message}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inspectors.map((insp) => (
            <TableRow key={insp.id}>
              <TableCell>
                {editingId === insp.id ? (
                  <div className="flex gap-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={() => saveEditName(insp.id)} disabled={loading}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <span>{insp.full_name || "—"}</span>
                )}
              </TableCell>
              <TableCell className="capitalize">{insp.role}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(insp.id);
                      setEditName(insp.full_name ?? "");
                    }}
                  >
                    Edit
                  </Button>
                  {insp.role !== "admin" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deactivateInspector(insp.id)}
                      disabled={loading}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {inspectors.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-sm text-neutral-500">
                No inspectors found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Pencil, Trash2, Languages } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import { signOut } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";

type ItemTranslation = {
  id: string;
  englishName: string;
  urduName: string;
  createdAt: string;
  updatedAt: string;
};

const ItemTranslationsPage = () => {
  const [translations, setTranslations] = useState<ItemTranslation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [englishName, setEnglishName] = useState("");
  const [urduName, setUrduName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchTranslations = async () => {
    try {
      const res = await fetch("/api/item-translations");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTranslations(data);
      }
    } catch (error) {
      console.error("Failed to fetch translations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setEnglishName("");
    setUrduName("");
  };

  const handleEdit = (item: ItemTranslation) => {
    setEditingId(item.id);
    setEnglishName(item.englishName);
    setUrduName(item.urduName);
  };

  const handleSave = async () => {
    if (!englishName.trim() || !urduName.trim()) {
      toast({ title: "Both fields are required", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { id: editingId, englishName, urduName }
        : { englishName, urduName };

      const res = await fetch("/api/item-translations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: data.error || "Failed to save", variant: "destructive" });
        return;
      }

      toast({
        title: editingId
          ? "Translation updated successfully"
          : "Translation added successfully",
      });
      resetForm();
      fetchTranslations();
    } catch (error) {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/item-translations?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast({ title: data.error || "Failed to delete", variant: "destructive" });
        return;
      }

      toast({ title: "Translation deleted successfully" });
      fetchTranslations();
    } catch (error) {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };

  const filteredTranslations = translations.filter(
    (t) =>
      t.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.urduName.includes(searchTerm)
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-muted/40 px-6">
        <div className="flex items-center gap-3 w-full">
          <Languages className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium text-foreground">Item Translations</span>
        </div>
        <DarkModeToggle />
        <Button onClick={() => signOut()} type="submit">
          Sign Out
        </Button>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between pt-3 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Languages className="h-8 w-8" />
              Item Name Translations
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Map English item names to Urdu for printable bills. These translations are used automatically in bill generation.
            </p>
          </div>
        </div>

        {/* Add / Edit Form */}
        <div className="mb-8 p-5 bg-muted/50 rounded-lg border max-w-2xl">
          <h3 className="text-lg font-medium text-foreground mb-4">
            {editingId ? "Edit Translation" : "Add New Translation"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="englishName" className="text-sm font-medium">
                English Name
              </Label>
              <Input
                id="englishName"
                type="text"
                placeholder="e.g. Khajoor"
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="urduName" className="text-sm font-medium">
                Urdu Name
              </Label>
              <Input
                id="urduName"
                type="text"
                placeholder="e.g. کھجور"
                value={urduName}
                onChange={(e) => setUrduName(e.target.value)}
                className="mt-1"
                dir="rtl"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isSaving
                ? "Saving..."
                : editingId
                ? "Update Translation"
                : "Add Translation"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="mb-4">
          <span className="text-sm text-muted-foreground">
            Total translations: <strong>{translations.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">S.No</TableHead>
                <TableHead>English Name</TableHead>
                <TableHead>Urdu Name</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredTranslations.length > 0 ? (
                filteredTranslations.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium capitalize">
                      {item.englishName}
                    </TableCell>
                    <TableCell dir="rtl" className="text-lg">
                      {item.urduName}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete this translation?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the Urdu translation for &quot;{item.englishName}&quot;. 
                                Bills will show the English name instead.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item.id)}
                                className="bg-red-500"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    {searchTerm
                      ? "No matching translations found."
                      : "No translations added yet. Add one above."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ItemTranslationsPage;
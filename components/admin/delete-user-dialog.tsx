"use client";

import { useState, useTransition } from "react";
import { UserRole } from "@prisma/client";
import { deleteUserAdminAction } from "@/server/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Loader2, AlertOctagon, X } from "lucide-react";

interface DeleteUserDialogProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  };
  isSelf: boolean;
  onSuccess: (deletedUserId: string) => void;
}

export function DeleteUserDialog({
  user,
  isSelf,
  onSuccess,
}: DeleteUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isSelf) {
    return null; // Cannot delete self
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteUserAdminAction(user.id);
        if (result.success) {
          toast.success(result.message);
          onSuccess(user.id);
          setIsOpen(false);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to delete account");
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
        title="Permanently Delete User"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Permanently Delete Account
                  </h3>
                  <p className="text-xs text-rose-600 font-semibold">
                    Irreversible Super Admin Action
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                Are you sure you want to permanently delete the account for:
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white">
                  {user.name || "Anonymous User"}
                </p>
                <p className="text-xs font-mono text-slate-500">{user.email}</p>
                <p className="text-[11px] font-semibold text-primary mt-1 uppercase">
                  Role: {user.role}
                </p>
              </div>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium leading-relaxed">
                ⚠️ Warning: This will permanently purge their profiles, job applications,
                memberships, and authentication access from the database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirm Permanent Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

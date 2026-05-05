"use client";

import { useState } from "react";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDeleteGroupReport, useGroupReports, useSuspendGroupUsers } from "@/lib/api/admin/admin.hooks";

type GroupAction =
  | { type: "delete"; reportId: string; groupName: string }
  | { type: "suspend-users"; reportId: string; groupName: string };

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function GroupReportsPage() {
  const { data, isLoading } = useGroupReports();
  const deleteMutation = useDeleteGroupReport();
  const suspendMutation = useSuspendGroupUsers();
  const [pendingAction, setPendingAction] = useState<GroupAction | null>(null);

  const confirmAction = async () => {
    if (!pendingAction) return;

    if (pendingAction.type === "delete") {
      await deleteMutation.mutateAsync(pendingAction.reportId);
      toast.success(`Deleted group "${pendingAction.groupName}"`);
    } else {
      await suspendMutation.mutateAsync(pendingAction.reportId);
      toast.success(`Suspended users from "${pendingAction.groupName}"`);
    }

    setPendingAction(null);
  };

  return (
    <div className="space-y-6">
      <Card className="brand-gradient-border">
        <CardHeader>
          <CardTitle className="brand-gradient-text">Group Chat Reports</CardTitle>
          <CardDescription>
            Review reported groups and apply moderation actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="rounded-lg border p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group name</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reported by</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Loading reports...
                  </TableCell>
                </TableRow>
              ) : !data?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No reports available.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.groupName}</TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>@{report.reportedBy}</TableCell>
                    <TableCell>{dateFormatter.format(new Date(report.date))}</TableCell>
                    <TableCell>{report.reportCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPendingAction({
                              type: "suspend-users",
                              reportId: report.id,
                              groupName: report.groupName,
                            })
                          }
                        >
                          Suspend Users
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            setPendingAction({
                              type: "delete",
                              reportId: report.id,
                              groupName: report.groupName,
                            })
                          }
                        >
                          Delete Group
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(pendingAction)} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm moderation action</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction
                ? pendingAction.type === "delete"
                  ? `Delete "${pendingAction.groupName}" and clear its report history?`
                  : `Suspend users in "${pendingAction.groupName}" based on this report?`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuditLogs } from "@/lib/api/admin/admin.hooks";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default function AuditLogPage() {
  const { data, isLoading } = useAuditLogs();

  return (
    <Card className="brand-gradient-border">
      <CardHeader>
        <CardTitle className="brand-gradient-text">Admin Action Log</CardTitle>
        <CardDescription>
          Full audit trail of privileged actions in the admin panel.
        </CardDescription>
      </CardHeader>
      <CardContent className="rounded-lg border p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Loading audit logs...
                </TableCell>
              </TableRow>
            ) : !data?.length ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No audit entries available.
                </TableCell>
              </TableRow>
            ) : (
              data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>{log.actor}</TableCell>
                  <TableCell>{log.target}</TableCell>
                  <TableCell>{dateFormatter.format(new Date(log.createdAt))}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { accountApi } from "@/lib/api";
import { useSessionStore } from "@/lib/auth/session-store";
import { formatDateTime } from "@/lib/utils";

export default function NotificationsPage() {
  const status = useSessionStore((s) => s.status);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", 0],
    queryFn: () => accountApi.listNotifications(0, 20),
    enabled: status === "authenticated",
  });

  const markRead = useMutation({
    mutationFn: (id: number) => accountApi.markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAll = useMutation({
    mutationFn: () => accountApi.markAllNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  if (status === "anonymous") {
    return (
      <div className="grid place-items-center gap-4 py-24 text-center">
        <Bell className="text-muted-foreground h-10 w-10" aria-hidden />
        <p className="text-lg font-semibold">Sign in to see notifications</p>
        <Link href="/login?next=/notifications" className="text-primary font-medium hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  if (isLoading) return <PageLoader />;

  const notifications = data?.content ?? [];
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          {unread > 0 ? (
            <p className="text-muted-foreground text-sm">{unread} unread</p>
          ) : null}
        </div>
        {unread > 0 ? (
          <Button variant="outline" size="sm" disabled={markAll.isPending} onClick={() => markAll.mutate()}>
            Mark all read
          </Button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <div className="border-border grid place-items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <BellOff className="text-muted-foreground h-10 w-10" aria-hidden />
          <p className="text-muted-foreground text-sm">No notifications.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((notification) => {
            const body = (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {!notification.readAt ? (
                      <span className="bg-primary h-2 w-2 rounded-full" aria-label="Unread" />
                    ) : null}
                    {notification.title}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatDateTime(notification.createdAt)}
                  </span>
                </div>
                {notification.body ? (
                  <p className="text-muted-foreground mt-1 text-sm">{notification.body}</p>
                ) : null}
              </>
            );

            return (
              <li key={notification.id}>
                {notification.link ? (
                  <Link
                    href={notification.link}
                    className="border-border bg-card hover:bg-border/20 block rounded-xl border p-4"
                    onClick={() => {
                      if (!notification.readAt) markRead.mutate(notification.id);
                    }}
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="border-border bg-card rounded-xl border p-4">
                    {body}
                    {!notification.readAt ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => markRead.mutate(notification.id)}
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

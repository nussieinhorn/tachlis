import type { Comment, Update } from "@/lib/mock-data";
import { JoinPanel } from "@/components/issue/join-panel";
import { AdminUpdates } from "@/components/issue/admin-updates";
import { CommentThread } from "@/components/issue/comment-thread";
import { IssueLinksSection } from "@/components/issue/issue-links-section";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export function IssueSidebar({
  issueId,
  issueTitle,
  isPrivate,
  ownerName,
  canEdit,
  supporterCount,
  shareCount,
  visitCount,
  viewCount,
  supporterBreakdown,
  updates,
  discussion,
  links,
  commentsEnabled,
  commentsRequireLogin,
}: {
  issueId: string;
  issueTitle: string;
  isPrivate: boolean;
  ownerName?: string;
  canEdit: boolean;
  supporterCount: number;
  shareCount: number;
  visitCount: number;
  viewCount: number;
  supporterBreakdown?: { justSupport: number; resonates: number; willingToHelp: number };
  updates: Update[];
  discussion: Comment[];
  links?: { id: string; label: string; url: string }[];
  commentsEnabled: boolean;
  commentsRequireLogin: boolean;
}) {
  const showCommentsTab = commentsEnabled || canEdit;

  return (
    <aside className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-6 pb-6">
          <JoinPanel
            issueId={issueId}
            issueTitle={issueTitle}
            isPrivate={isPrivate}
            canEdit={canEdit}
            ownerName={ownerName}
            initialSupporterCount={supporterCount}
            shareCount={shareCount}
            visitCount={visitCount}
            viewCount={viewCount}
            supporterBreakdown={supporterBreakdown}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 pb-6">
          {showCommentsTab ? (
            <Tabs defaultValue="updates">
              <TabsList className="w-full">
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>
              <TabsContent value="updates" className="pt-4">
                <AdminUpdates issueId={issueId} initialUpdates={updates} canEdit={canEdit} />
              </TabsContent>
              <TabsContent value="comments" className="pt-4">
                {canEdit && !commentsEnabled && (
                  <p className="mb-3 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    Comments are off — only you can see this tab.
                  </p>
                )}
                <CommentThread
                  issueId={issueId}
                  initialComments={discussion}
                  commentsEnabled={commentsEnabled}
                  commentsRequireLogin={commentsRequireLogin}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <AdminUpdates issueId={issueId} initialUpdates={updates} canEdit={canEdit} />
          )}
        </CardContent>
      </Card>

      <IssueLinksSection issueId={issueId} initialLinks={links} canEdit={canEdit} />
    </aside>
  );
}

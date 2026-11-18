import type { Comment, Update } from "@/lib/mock-data";
import { JoinPanel } from "@/components/issue/join-panel";
import { AdminUpdates } from "@/components/issue/admin-updates";
import { CommentsDialog } from "@/components/issue/comments-dialog";
import { IssueLinksSection } from "@/components/issue/issue-links-section";
import { VolunteersDialog } from "@/components/issue/volunteers-dialog";
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
  supportRequiresLogin = false,
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
  supportRequiresLogin?: boolean;
}) {
  const showCommentsTab = commentsEnabled || canEdit;

  return (
    <aside className="flex flex-col gap-6 max-lg:contents">
      <Card id="support-card" className="max-lg:order-[20]">
        <CardContent className="max-sm:px-5 max-sm:pt-5 max-sm:pb-5 pt-6 pb-6">
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
            supportRequiresLogin={supportRequiresLogin}
          />
        </CardContent>
      </Card>

      {canEdit && (
        <div className="max-lg:order-[22] empty:hidden">
          <VolunteersDialog issueId={issueId} count={supporterBreakdown?.willingToHelp ?? 0} />
        </div>
      )}

      {/* Updates and comments sit open on the page, with no box or rule. */}
      <div className="flex flex-col gap-5 max-lg:order-[50]">
        <div className="flex flex-col gap-5">
          <AdminUpdates issueId={issueId} initialUpdates={updates} canEdit={canEdit} authorName={ownerName} />
          {showCommentsTab && (
            <CommentsDialog
              issueId={issueId}
              comments={discussion}
              canEdit={canEdit}
              commentsEnabled={commentsEnabled}
              commentsRequireLogin={commentsRequireLogin}
            />
          )}
        </div>
      </div>

      <div className="max-lg:order-[60] empty:hidden">
        <IssueLinksSection issueId={issueId} initialLinks={links} canEdit={canEdit} />
      </div>
    </aside>
  );
}

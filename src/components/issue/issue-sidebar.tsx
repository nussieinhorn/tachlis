import type { Comment, Update } from "@/lib/mock-data";
import { JoinPanel } from "@/components/issue/join-panel";
import { AdminUpdates } from "@/components/issue/admin-updates";
import { CommentThread } from "@/components/issue/comment-thread";
import { IssueLinksSection } from "@/components/issue/issue-links-section";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export function IssueSidebar({
  supporterCount,
  shareCount,
  visitCount,
  viewCount,
  supporterBreakdown,
  updates,
  discussion,
  links,
}: {
  supporterCount: number;
  shareCount: number;
  visitCount: number;
  viewCount: number;
  supporterBreakdown?: { justSupport: number; resonates: number; willingToHelp: number };
  updates: Update[];
  discussion: Comment[];
  links?: { id: string; label: string; url: string }[];
}) {
  return (
    <aside className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-6 pb-6">
          <JoinPanel
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
          <Tabs defaultValue="updates">
            <TabsList className="w-full">
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
            <TabsContent value="updates" className="pt-4">
              <AdminUpdates initialUpdates={updates} />
            </TabsContent>
            <TabsContent value="comments" className="pt-4">
              <CommentThread initialComments={discussion} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <IssueLinksSection initialLinks={links} />
    </aside>
  );
}

import type { Comment, Update } from "@/lib/mock-data";
import { JoinPanel } from "@/components/issue/join-panel";
import { AdminUpdates } from "@/components/issue/admin-updates";
import { Discussion } from "@/components/issue/discussion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export function IssueSidebar({
  supporterCount,
  shareCount,
  updates,
  discussion,
}: {
  supporterCount: number;
  shareCount: number;
  updates: Update[];
  discussion: Comment[];
}) {
  return (
    <aside className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-6 pb-6">
          <JoinPanel initialSupporterCount={supporterCount} shareCount={shareCount} />
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
              <Discussion initialComments={discussion} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </aside>
  );
}

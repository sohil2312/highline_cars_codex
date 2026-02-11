"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanySettingsTab } from "./company-settings-tab";
import { InspectorManagementTab } from "./inspector-management-tab";
import { TemplateManagementTab } from "./template-management-tab";
import { MyProfileTab } from "./my-profile-tab";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
}

export function SettingsModal({ open, onOpenChange, isAdmin }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={isAdmin ? "company" : "profile"}>
          <TabsList>
            {isAdmin && <TabsTrigger value="company">Company</TabsTrigger>}
            {isAdmin && <TabsTrigger value="inspectors">Inspectors</TabsTrigger>}
            {isAdmin && <TabsTrigger value="templates">Templates</TabsTrigger>}
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>
          {isAdmin && (
            <TabsContent value="company">
              <CompanySettingsTab />
            </TabsContent>
          )}
          {isAdmin && (
            <TabsContent value="inspectors">
              <InspectorManagementTab />
            </TabsContent>
          )}
          {isAdmin && (
            <TabsContent value="templates">
              <TemplateManagementTab />
            </TabsContent>
          )}
          <TabsContent value="profile">
            <MyProfileTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

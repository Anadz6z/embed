export interface Tab {
  id: string;
  label: string;
  emoji?: string;
  description?: string;
  content: any;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabGroup {
  id: string;
  title: string;
  description?: string;
  tabs: Tab[];
  activeTabId: string;
  userId: string;
  guildId?: string;
  createdAt: Date;
  updatedAt: Date;
  persistent: boolean;
}

export class TabsManager {
  private tabGroups = new Map<string, TabGroup>();

  createTabGroup(
    id: string,
    title: string,
    tabs: Tab[],
    userId: string,
    options?: {
      description?: string;
      guildId?: string;
      persistent?: boolean;
      defaultTabId?: string;
    }
  ): TabGroup {
    const tabGroup: TabGroup = {
      id,
      title,
      description: options?.description,
      tabs,
      activeTabId: options?.defaultTabId || tabs[0]?.id || "",
      userId,
      guildId: options?.guildId,
      createdAt: new Date(),
      updatedAt: new Date(),
      persistent: options?.persistent ?? false
    };

    this.tabGroups.set(id, tabGroup);
    return tabGroup;
  }

  getTabGroup(id: string): TabGroup | undefined {
    return this.tabGroups.get(id);
  }

  getUserTabGroups(userId: string): TabGroup[] {
    return Array.from(this.tabGroups.values()).filter(tg => tg.userId === userId);
  }

  getGuildTabGroups(guildId: string): TabGroup[] {
    return Array.from(this.tabGroups.values()).filter(tg => tg.guildId === guildId);
  }

  switchTab(groupId: string, tabId: string): boolean {
    const tabGroup = this.tabGroups.get(groupId);
    if (!tabGroup) return false;

    const tab = tabGroup.tabs.find(t => t.id === tabId);
    if (!tab || tab.disabled) return false;

    tabGroup.activeTabId = tabId;
    tabGroup.updatedAt = new Date();
    return true;
  }

  addTab(groupId: string, tab: Tab, position?: number): boolean {
    const tabGroup = this.tabGroups.get(groupId);
    if (!tabGroup) return false;

    if (position !== undefined && position >= 0 && position <= tabGroup.tabs.length) {
      tabGroup.tabs.splice(position, 0, tab);
    } else {
      tabGroup.tabs.push(tab);
    }

    tabGroup.updatedAt = new Date();
    return true;
  }

  removeTab(groupId: string, tabId: string): boolean {
    const tabGroup = this.tabGroups.get(groupId);
    if (!tabGroup) return false;

    const tabIndex = tabGroup.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return false;

    tabGroup.tabs.splice(tabIndex, 1);

    // If the removed tab was active, switch to the first available tab
    if (tabGroup.activeTabId === tabId && tabGroup.tabs.length > 0) {
      tabGroup.activeTabId = tabGroup.tabs[0].id;
    }

    tabGroup.updatedAt = new Date();
    return true;
  }

  updateTab(groupId: string, tabId: string, updates: Partial<Tab>): boolean {
    const tabGroup = this.tabGroups.get(groupId);
    if (!tabGroup) return false;

    const tab = tabGroup.tabs.find(t => t.id === tabId);
    if (!tab) return false;

    Object.assign(tab, updates);
    tabGroup.updatedAt = new Date();
    return true;
  }

  getActiveTab(groupId: string): Tab | undefined {
    const tabGroup = this.tabGroups.get(groupId);
    if (!tabGroup) return undefined;

    return tabGroup.tabs.find(t => t.id === tabGroup.activeTabId);
  }

  getTab(groupId: string, tabId: string): Tab | undefined {
    const tabGroup = this.tabGroups.get(groupId);
    if (!tabGroup) return undefined;

    return tabGroup.tabs.find(t => t.id === tabId);
  }

  moveTab(groupId: string, tabId: string, newPosition: number): boolean {
    const tabGroup = this.tabGroups.get(groupId);
    if (!tabGroup) return false;

    const tabIndex = tabGroup.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return false;

    if (newPosition < 0 || newPosition >= tabGroup.tabs.length) return false;

    const [tab] = tabGroup.tabs.splice(tabIndex, 1);
    tabGroup.tabs.splice(newPosition, 0, tab);
    tabGroup.updatedAt = new Date();
    return true;
  }

  deleteTabGroup(groupId: string): boolean {
    return this.tabGroups.delete(groupId);
  }

  updateTabContent(groupId: string, tabId: string, content: any): boolean {
    const tabGroup = this.tabGroups.get(groupId);
    if (!tabGroup) return false;

    const tab = tabGroup.tabs.find(t => t.id === tabId);
    if (!tab) return false;

    tab.content = content;
    tabGroup.updatedAt = new Date();
    return true;
  }

  setTabBadge(groupId: string, tabId: string, badge?: string | number): boolean {
    const tabGroup = this.tabGroups.get(groupId);
    if (!tabGroup) return false;

    const tab = tabGroup.tabs.find(t => t.id === tabId);
    if (!tab) return false;

    tab.badge = badge;
    tabGroup.updatedAt = new Date();
    return true;
  }

  enableTab(groupId: string, tabId: string): boolean {
    return this.updateTab(groupId, tabId, { disabled: false });
  }

  disableTab(groupId: string, tabId: string): boolean {
    return this.updateTab(groupId, tabId, { disabled: true });
  }

  getAllTabGroups(): TabGroup[] {
    return Array.from(this.tabGroups.values());
  }

  cleanupNonPersistentTabGroups(maxAge: number = 60 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, tabGroup] of this.tabGroups) {
      if (!tabGroup.persistent && now - tabGroup.updatedAt.getTime() > maxAge) {
        this.tabGroups.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }

  getTabGroupStats(groupId: string) {
    const tabGroup = this.tabGroups.get(groupId);
    if (!tabGroup) return null;

    return {
      totalTabs: tabGroup.tabs.length,
      enabledTabs: tabGroup.tabs.filter(t => !t.disabled).length,
      disabledTabs: tabGroup.tabs.filter(t => t.disabled).length,
      tabsWithBadges: tabGroup.tabs.filter(t => t.badge !== undefined).length,
      activeTabIndex: tabGroup.tabs.findIndex(t => t.id === tabGroup.activeTabId),
      lastUpdated: tabGroup.updatedAt
    };
  }
}

export const tabsManager = new TabsManager();
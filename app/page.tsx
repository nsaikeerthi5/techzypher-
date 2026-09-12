'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import QuestCard from '@/components/QuestCard';
import NewQuestModal from '@/components/NewQuestModal';
import EditQuestModal from '@/components/EditQuestModal';
import LevelUpModal from '@/components/LevelUpModal';
import AttributesRadar from '@/components/AttributesRadar';
import ShopAndInventory from '@/components/ShopAndInventory';
import WorldBossRaid from '@/components/WorldBossRaid';
import ActivityLogView from '@/components/ActivityLogView';
import AuthView from '@/components/AuthView';
import {
  ClientQuest,
  ClientItem,
  ClientInventoryItem,
  ClientActivityLog,
  ClientWorldBoss,
  QuestCategory,
  AttributeType,
  DifficultyType,
} from '@/lib/types';
import { Plus, Search, Filter, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';
import { sound } from '@/lib/audio';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [character, setCharacter] = useState<any>(null);
  const [quests, setQuests] = useState<ClientQuest[]>([]);
  const [items, setItems] = useState<ClientItem[]>([]);
  const [inventory, setInventory] = useState<ClientInventoryItem[]>([]);
  const [boss, setBoss] = useState<ClientWorldBoss | null>(null);
  const [logs, setLogs] = useState<ClientActivityLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('quests');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isNewQuestOpen, setIsNewQuestOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<ClientQuest | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ isOpen: boolean; newLevel: number } | null>(null);

  // Notifications / Toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Fetch current session
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setCharacter(data.user.character);
          return true;
        }
      }
      setUser(null);
      setCharacter(null);
      return false;
    } catch {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch full game data
  const loadGameData = useCallback(async () => {
    try {
      // Character
      const charRes = await fetch('/api/character');
      if (charRes.ok) {
        const charData = await charRes.json();
        setCharacter(charData.character);
      }

      // Quests
      const questsRes = await fetch('/api/quests');
      if (questsRes.ok) {
        const qData = await questsRes.json();
        setQuests(qData.quests);
      }

      // Shop Catalog
      const shopRes = await fetch('/api/shop');
      if (shopRes.ok) {
        const sData = await shopRes.json();
        setItems(sData.items);
      }

      // Boss
      const bossRes = await fetch('/api/boss');
      if (bossRes.ok) {
        const bData = await bossRes.json();
        setBoss(bData.boss);
      }

      // Logs
      const logsRes = await fetch('/api/logs');
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setLogs(lData.logs);
      }
    } catch (err: unknown) {
      console.error('Error loading game data:', err);
    }
  }, []);

  useEffect(() => {
    checkSession().then((authenticated) => {
      if (authenticated) {
        loadGameData();
      }
    });
  }, [checkSession, loadGameData]);

  // Auth Handlers
  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setCharacter(userData.character);
    loadGameData();
    showToast(`Welcome to Aethelgard, ${userData.character?.heroName || userData.username}!`, 'success');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      sound.playClick();
      setUser(null);
      setCharacter(null);
      setQuests([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Quest Actions
  const handleToggleComplete = async (questId: string) => {
    // Find quest
    const targetQuest = quests.find((q) => q.id === questId);
    if (!targetQuest) return;

    // Optimistic UI update
    const previousQuests = [...quests];
    const previousCharacter = character ? { ...character } : null;

    setQuests((prev) =>
      prev.map((q) =>
        q.id === questId
          ? {
              ...q,
              isCompleted: !q.isCompleted,
              completedAt: !q.isCompleted ? new Date().toISOString() : null,
            }
          : q
      )
    );

    try {
      const res = await fetch(`/api/quests/${questId}/complete`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete quest.');
      }

      // Sync character with server state
      if (data.character) {
        // Fetch fresh full character to recompute equipment and stats
        const charRes = await fetch('/api/character');
        if (charRes.ok) {
          const charData = await charRes.json();
          setCharacter(charData.character);
        } else {
          setCharacter(data.character);
        }
      }

      // Check level-up celebration trigger
      if (data.progression && data.progression.leveledUp) {
        setLevelUpData({
          isOpen: true,
          newLevel: data.progression.newLevel,
        });
      }

      // Reload Boss and Logs in background
      fetch('/api/boss')
        .then((r) => r.json())
        .then((d) => d.boss && setBoss(d.boss));
      fetch('/api/logs')
        .then((r) => r.json())
        .then((d) => d.logs && setLogs(d.logs));
    } catch (err: unknown) {
      // Rollback on network/server failure
      setQuests(previousQuests);
      if (previousCharacter) setCharacter(previousCharacter);
      showToast((err as Error)?.message || 'Network error updating quest.', 'error');
    }
  };

  const handleCreateQuest = async (data: {
    title: string;
    description?: string;
    category: QuestCategory;
    attribute: AttributeType;
    difficulty: DifficultyType;
    dueDate?: string;
  }) => {
    const res = await fetch('/api/quests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to create quest');

    setQuests((prev) => [resData.quest, ...prev]);
    showToast(`Inscribed quest: "${data.title}"`, 'success');
  };

  const handleUpdateQuest = async (
    id: string,
    data: {
      title: string;
      description?: string;
      category: QuestCategory;
      attribute: AttributeType;
      difficulty: DifficultyType;
      dueDate?: string;
    }
  ) => {
    const res = await fetch(`/api/quests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to update quest');

    setQuests((prev) => prev.map((q) => (q.id === id ? resData.quest : q)));
    showToast('Quest updated successfully.', 'success');
  };

  const handleDeleteQuest = async (id: string) => {
    if (!confirm('Are you sure you wish to dissolve this quest scroll?')) return;
    try {
      const res = await fetch(`/api/quests/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete quest');

      setQuests((prev) => prev.filter((q) => q.id !== id));
      showToast('Quest dissolved.', 'info');
    } catch (err: unknown) {
      showToast((err as Error)?.message || 'Failed to delete quest', 'error');
    }
  };

  // Shop & Inventory Handlers
  const handleBuyItem = async (itemId: string) => {
    const res = await fetch('/api/shop/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Purchase failed');

    // Refresh character and logs
    loadGameData();
    showToast(data.message || 'Purchased item!', 'success');
  };

  const handleEquipItem = async (invId: string) => {
    const res = await fetch('/api/inventory/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inventoryItemId: invId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Equip failed');

    loadGameData();
    showToast(data.message, 'success');
  };

  const handleCreateCustomReward = async (data: {
    name: string;
    description: string;
    cost: number;
    icon: string;
  }) => {
    const res = await fetch('/api/shop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to create reward');

    setItems((prev) => [...prev, resData.item]);
    showToast(`Custom reward "${data.name}" forged!`, 'success');
  };

  // Filtered Quests
  const filteredQuests = quests.filter((q) => {
    if (selectedCategory !== 'ALL' && q.category !== selectedCategory) return false;
    if (selectedAttribute !== 'ALL' && q.attribute !== selectedAttribute) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = q.title.toLowerCase().includes(query);
      const matchesDesc = q.description?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDesc) return false;
    }
    return true;
  });

  // Render Loading Skeleton
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rpg-darkest">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-3xl animate-pulse">
            ⚔️
          </div>
          <p className="text-amber-400 font-bold tracking-widest uppercase text-sm animate-pulse">
            Summoning Aethelgard Realm...
          </p>
        </div>
      </div>
    );
  }

  // Render Auth Portal if not logged in
  if (!user) {
    return <AuthView onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-once">
          <div
            className={`flex items-center space-x-2 rounded-xl px-4 py-3 text-xs font-bold shadow-2xl border ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-red-950/90 border-red-500 text-red-200'
                : 'bg-slate-900/90 border-amber-500 text-amber-200'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        username={user.username}
        heroName={character?.heroName || user.username}
        level={character?.level || 1}
        gold={character?.gold || 0}
        streak={character?.currentStreak || 0}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Hero Progression Banner (Always visible on top for instant status feedback) */}
        <HeroBanner
          character={character}
          onOpenStats={() => setActiveTab('character')}
        />

        {/* TAB 1: QUEST BOARD */}
        {activeTab === 'quests' && (
          <div className="space-y-5">
            {/* Action Bar: Filters, Search, and New Quest Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'ALL', label: 'All Quests' },
                  { id: 'DAILY', label: '📜 Daily Bounties' },
                  { id: 'HABIT', label: '🔄 Habits' },
                  { id: 'TODO', label: '🎯 Side Quests' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedCategory(c.id);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                      selectedCategory === c.id
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-sm shadow-amber-500/10'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Right: Attribute dropdown, Search, and Forge Quest */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Attribute Selector */}
                <select
                  value={selectedAttribute}
                  onChange={(e) => setSelectedAttribute(e.target.value)}
                  className="rounded-xl border border-rpg-border bg-rpg-darkest px-3 py-1.5 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
                >
                  <option value="ALL">All Attributes</option>
                  <option value="STRENGTH">⚔️ Strength (Gym/Body)</option>
                  <option value="INTELLECT">🔮 Intellect (Code/Study)</option>
                  <option value="VITALITY">🌿 Vitality (Health/Sleep)</option>
                  <option value="AGILITY">⚡ Agility (Chores/Speed)</option>
                  <option value="CHARISMA">🎭 Charisma (Social/Speech)</option>
                </select>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search quests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-36 sm:w-48 rounded-xl border border-rpg-border bg-rpg-darkest px-3 py-1.5 pl-8 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                </div>

                {/* Embark / Forge New Quest Button */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsNewQuestOpen(true);
                  }}
                  className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-rpg-darkest shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Embark on Quest</span>
                </button>
              </div>
            </div>

            {/* Quests Listing */}
            {filteredQuests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-400 space-y-3">
                <span className="text-4xl">📜</span>
                <h3 className="text-base font-bold text-slate-200">No quests found in this category</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your quest log is clear! Forge a new quest to begin earning experience points, gold, and slaying the procrastination titan.
                </p>
                <button
                  onClick={() => setIsNewQuestOpen(true)}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30"
                >
                  <Plus className="h-4 w-4" />
                  <span>Forge First Quest</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onToggleComplete={handleToggleComplete}
                    onEdit={(q) => setEditingQuest(q)}
                    onDelete={handleDeleteQuest}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HERO STATS & ATTRIBUTES RADAR */}
        {activeTab === 'character' && <AttributesRadar character={character} />}

        {/* TAB 3: SHOP & INVENTORY */}
        {activeTab === 'shop' && (
          <ShopAndInventory
            items={items}
            inventory={character?.inventory || []}
            gold={character?.gold || 0}
            onBuyItem={handleBuyItem}
            onEquipItem={handleEquipItem}
            onCreateCustomReward={handleCreateCustomReward}
          />
        )}

        {/* TAB 4: WORLD BOSS RAID */}
        {activeTab === 'boss' && <WorldBossRaid boss={boss} />}

        {/* TAB 5: HISTORICAL CHRONICLES & LOGS */}
        {activeTab === 'history' && <ActivityLogView logs={logs} />}
      </main>

      {/* MODALS */}
      <NewQuestModal
        isOpen={isNewQuestOpen}
        onClose={() => setIsNewQuestOpen(false)}
        onSubmit={handleCreateQuest}
      />

      <EditQuestModal
        quest={editingQuest}
        isOpen={!!editingQuest}
        onClose={() => setEditingQuest(null)}
        onSubmit={handleUpdateQuest}
      />

      {levelUpData && (
        <LevelUpModal
          isOpen={levelUpData.isOpen}
          newLevel={levelUpData.newLevel}
          heroName={character?.heroName || user.username}
          onClose={() => setLevelUpData(null)}
        />
      )}
    </div>
  );
}

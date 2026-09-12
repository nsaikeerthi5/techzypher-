'use client';

import React, { useState } from 'react';
import { Coins, Shield, Sword, Sparkles, Plus, Check, Coffee, Zap, Gift, ShoppingBag, Backpack } from 'lucide-react';
import { ClientItem, ClientInventoryItem } from '@/lib/types';
import { sound } from '@/lib/audio';

interface ShopAndInventoryProps {
  items: ClientItem[];
  inventory: ClientInventoryItem[];
  gold: number;
  onBuyItem: (itemId: string) => Promise<void>;
  onEquipItem: (invId: string) => Promise<void>;
  onCreateCustomReward: (data: { name: string; description: string; cost: number; icon: string }) => Promise<void>;
}

export default function ShopAndInventory({
  items,
  inventory,
  gold,
  onBuyItem,
  onEquipItem,
  onCreateCustomReward,
}: ShopAndInventoryProps) {
  const [subTab, setSubTab] = useState<'shop' | 'inventory'>('shop');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCost, setCustomCost] = useState('50');
  const [customIcon, setCustomIcon] = useState('gift');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBuy = async (item: ClientItem) => {
    if (gold < item.cost) {
      setErrorMsg(`You need ${item.cost} GP to purchase "${item.name}", but currently only have ${gold} GP.`);
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    setIsProcessing(item.id);
    try {
      sound.playBuy();
      await onBuyItem(item.id);
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Failed to complete purchase.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleEquip = async (invId: string) => {
    setIsProcessing(invId);
    try {
      sound.playClick();
      await onEquipItem(invId);
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Failed to update equipment.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    try {
      sound.playClick();
      await onCreateCustomReward({
        name: customName.trim(),
        description: customDesc.trim() || 'Custom real-world reward.',
        cost: parseInt(customCost, 10) || 50,
        icon: customIcon,
      });
      setCustomName('');
      setCustomDesc('');
      setCustomCost('50');
      setIsCustomModalOpen(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Failed to create reward.');
    }
  };

  // Icon mapper
  const getIcon = (iconName: string, category: string) => {
    switch (iconName) {
      case 'sword': return '⚔️';
      case 'book': return '📖';
      case 'shield': return '🛡️';
      case 'feather': return '🪶';
      case 'sparkles': return '✨';
      case 'flame': return '🔥';
      case 'clock': return '⏳';
      case 'coffee': return '☕';
      case 'gamepad': return '🎮';
      case 'zap': return '⚡';
      default:
        if (category === 'WEAPON') return '⚔️';
        if (category === 'ARMOR') return '🛡️';
        if (category === 'RELIC') return '✨';
        if (category === 'REAL_WORLD') return '🎁';
        return '🧪';
    }
  };

  const filteredItems = items.filter((it) => {
    if (filterCategory === 'ALL') return true;
    return it.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-rpg-border bg-rpg-darker p-5 sm:p-6 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🪙</span>
            <h2 className="text-xl font-bold text-amber-400">Merchant’s Bazaar & Armory</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Spend hard-earned Gold on equipment buffs, discipline potions, and real-world indulgence vouchers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sub-Tabs: Shop vs Armory */}
          <div className="flex rounded-xl bg-rpg-darkest p-1 border border-rpg-border">
            <button
              onClick={() => {
                sound.playClick();
                setSubTab('shop');
              }}
              className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                subTab === 'shop'
                  ? 'bg-amber-500 text-rpg-darkest shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Bazaar (Shop)</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setSubTab('inventory');
              }}
              className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                subTab === 'inventory'
                  ? 'bg-amber-500 text-rpg-darkest shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Backpack className="h-3.5 w-3.5" />
              <span>Armory ({inventory.length})</span>
            </button>
          </div>

          {subTab === 'shop' && (
            <button
              onClick={() => {
                sound.playClick();
                setIsCustomModalOpen(true);
              }}
              className="flex items-center space-x-1 rounded-xl border border-amber-500/40 bg-amber-950/20 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-950/40 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Forge Reward</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-800/60 bg-red-950/40 p-3.5 text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      {/* SHOP VIEW */}
      {subTab === 'shop' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'All Goods' },
              { id: 'WEAPON', label: '⚔️ Weapons' },
              { id: 'ARMOR', label: '🛡️ Armor' },
              { id: 'RELIC', label: '✨ Relics' },
              { id: 'CONSUMABLE', label: '🧪 Consumables' },
              { id: 'REAL_WORLD', label: '🎁 Real-World Vouchers' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setFilterCategory(cat.id);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                  filterCategory === cat.id
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const canAfford = gold >= item.cost;
              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-rpg-border/70 bg-gradient-to-b from-rpg-surface/60 to-rpg-darker p-5 transition-all hover:border-amber-500/40 hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-700 text-2xl">
                          {getIcon(item.icon, item.category)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm">{item.name}</h3>
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Stat bonus chip if applicable */}
                      {item.statBonus > 0 && (
                        <span className="rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-400">
                          +{item.statBonus} {item.statAttribute}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm font-black text-amber-400">
                      <Coins className="h-4 w-4" />
                      <span>{item.cost} GP</span>
                    </div>

                    <button
                      onClick={() => handleBuy(item)}
                      disabled={isProcessing === item.id}
                      className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                        canAfford
                          ? 'bg-amber-500 text-rpg-darkest hover:bg-amber-400 shadow-md shadow-amber-500/20 active:scale-95'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="h-3.5 w-3.5" />
                      <span>{isProcessing === item.id ? 'Purchasing...' : canAfford ? 'Acquire' : 'Need GP'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ARMORY / INVENTORY VIEW */}
      {subTab === 'inventory' && (
        <div className="space-y-4">
          {inventory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
              <Backpack className="mx-auto h-10 w-10 text-slate-600 mb-2" />
              <p className="text-sm">Your armory is empty. Complete quests and visit the Bazaar to acquire gear!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((inv) => {
                const item = inv.item;
                if (!item) return null;
                const isEquippable = ['WEAPON', 'ARMOR', 'RELIC'].includes(item.category);

                return (
                  <div
                    key={inv.id}
                    className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                      inv.isEquipped
                        ? 'border-amber-500/80 bg-amber-950/20 shadow-lg shadow-amber-500/10'
                        : 'border-rpg-border/70 bg-rpg-surface/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-700 text-2xl">
                            {getIcon(item.icon, item.category)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-100 text-sm">{item.name}</h3>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                                {item.category}
                              </span>
                              {inv.quantity > 1 && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  x{inv.quantity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {inv.isEquipped && (
                          <span className="flex items-center space-x-1 rounded-full bg-amber-500/20 border border-amber-500/50 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            <Check className="h-3 w-3" />
                            <span>Equipped</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {item.statBonus > 0 && (
                        <div className="mt-2 text-xs font-semibold text-emerald-400">
                          Active Bonus: +{item.statBonus} {item.statAttribute}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end">
                      {isEquippable && (
                        <button
                          onClick={() => handleEquip(inv.id)}
                          disabled={isProcessing === inv.id}
                          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                            inv.isEquipped
                              ? 'border border-slate-700 text-slate-300 hover:bg-slate-800'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 text-rpg-darkest hover:from-amber-400'
                          }`}
                        >
                          {isProcessing === inv.id
                            ? 'Updating...'
                            : inv.isEquipped
                            ? 'Unequip'
                            : 'Equip Item'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE CUSTOM REWARD MODAL */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-rpg-border bg-rpg-darker p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-400 mb-2">Forge Custom Real-World Reward</h3>
            <p className="text-xs text-slate-400 mb-4">
              Motivate yourself by linking real-world rewards to in-game Gold (e.g., gaming hours, cheat meal, guilt-free purchases).
            </p>

            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Reward Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Watch 1 Episode of Anime, Order Sushi..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full rounded-xl border border-rpg-border bg-rpg-darkest px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. 45 min guilt-free leisure time"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full rounded-xl border border-rpg-border bg-rpg-darkest px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Gold Cost (GP)
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={customCost}
                  onChange={(e) => setCustomCost(e.target.value)}
                  className="w-full rounded-xl border border-rpg-border bg-rpg-darkest px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-rpg-darkest hover:bg-amber-400"
                >
                  Inscribe Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

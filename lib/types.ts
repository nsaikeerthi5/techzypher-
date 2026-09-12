export type AttributeType = 'STRENGTH' | 'INTELLECT' | 'VITALITY' | 'AGILITY' | 'CHARISMA';
export type DifficultyType = 'TRIVIAL' | 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY';
export type QuestCategory = 'HABIT' | 'DAILY' | 'TODO' | 'BOSS_RAID';
export type ItemCategory = 'WEAPON' | 'ARMOR' | 'RELIC' | 'CONSUMABLE' | 'REAL_WORLD';

export interface UserSession {
  id: string;
  email: string;
  username: string;
}

export interface CharacterWithInventory {
  id: string;
  userId: string;
  heroName: string;
  heroClass: string;
  avatar: string;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  gold: number;
  hp: number;
  maxHp: number;
  strength: number;
  intellect: number;
  vitality: number;
  agility: number;
  charisma: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  equippedItems: {
    weapon?: ClientItem;
    armor?: ClientItem;
    relic?: ClientItem;
  };
  inventory: ClientInventoryItem[];
}

export interface ClientItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  cost: number;
  icon: string;
  statAttribute: AttributeType | null;
  statBonus: number;
  isCustom: boolean;
}

export interface ClientInventoryItem {
  id: string;
  characterId: string;
  itemId: string;
  item: ClientItem;
  quantity: number;
  isEquipped: boolean;
  acquiredAt: string;
}

export interface ClientQuest {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: QuestCategory;
  attribute: AttributeType;
  difficulty: DifficultyType;
  xpReward: number;
  goldReward: number;
  isCompleted: boolean;
  completedAt: string | null;
  dueDate: string | null;
  streakCount: number;
  createdAt: string;
}

export interface ClientActivityLog {
  id: string;
  action: string;
  details: string;
  xpEarned: number;
  goldEarned: number;
  createdAt: string;
}

export interface ClientWorldBoss {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  currentHp: number;
  level: number;
  avatar: string;
  description: string;
  isActive: boolean;
}

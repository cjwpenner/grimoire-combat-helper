export interface Trait {
  name: string;
  description: string;
}

export interface Damage {
  formula?: string;
  type?: string;
  average?: number;
  versatile_formula?: string;
  versatile_average?: number;
}

export interface Action {
  id: string;
  name: string;
  kind: string;
  description: string;
  attack_bonus?: number;
  reach_or_range?: string;
  damage?: Damage;
  rider_effect?: string;
}

export interface Multiattack {
  description: string;
  patterns?: any;
}

export interface Monster {
  id: number;
  name: string;
  size: string;
  type: string;
  challenge_rating: number;
  xp: number;
  armor_class: number;
  hit_points: number;
  hit_dice: string;
  speed: Record<string, number>;
  ability_scores: Record<string, number>;
  traits: Trait[];
  actions: Action[];
  
  subtype?: string;
  alignment?: string;
  armor_class_note?: string;
  saving_throws?: Record<string, number>;
  skills?: Record<string, number>;
  damage_vulnerabilities?: string;
  damage_resistances?: string;
  damage_immunities?: string;
  condition_immunities?: string;
  senses?: string;
  languages?: string;
  multiattack?: Multiattack | null;
  reactions?: any[];
  v1_unsupported_features?: string[];
  has_image?: boolean;
  image_url?: string;
  legendary_actions?: Action[];
}

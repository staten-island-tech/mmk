import * as z from "zod";

/** Rarity schema. */
export const RaritySchema = z.object({
  /** The rarity ID. */
  id: z.number(),
  /** The rarity weight/order. */
  weight: z.number(),
  /** The rarity name. */
  name: z.string(),
  /** The rarity plate color as a hex string. */
  plateColor: z.string(),
  /** The desperation constant. */
  desperationConstant: z.number(),
});

/** Move domain schema. */
export const MoveDomainSchema = z.object({
  /** The move domain ID. */
  id: z.number(),
  /** The component name to render. */
  componentName: z.string(),
});

/** Move schema. */
export const MoveSchema = z.object({
  /** The move ID. */
  id: z.number(),
  /** The move name. */
  name: z.string(),
  /** The move cost. */
  cost: z.number().nullable(),
  /** The move damage. */
  damage: z.number().nullable(),
  /** The move cooldown duration (in moves). */
  cooldownDuration: z.number(),

  /** The domain component triggered by this move. */
  domain: MoveDomainSchema.nullable(),
  /** The duration of the domain (in moves). */
  domainDuration: z.number(),

  // Self properties
  selfDefenseMultiplier: z.tuple([z.number(), z.number()]).nullable(),
  selfAttackMultiplier: z.tuple([z.number(), z.number()]).nullable(),
  selfMoveEnergyMultiplier: z.tuple([z.number(), z.number()]).nullable(),
  selfMoveEnergyGainMultiplier: z.tuple([z.number(), z.number()]).nullable(),
  selfDesperationMultiplier: z.tuple([z.number(), z.number()]).nullable(),
  selfDefenseScalarBoost: z.tuple([z.number(), z.number()]).nullable(),
  selfAttackScalarBoost: z.tuple([z.number(), z.number()]).nullable(),
  selfMoveEnergyScalarBoost: z.tuple([z.number(), z.number()]).nullable(),
  selfMoveEnergyGainScalarBoost: z.tuple([z.number(), z.number()]).nullable(),
  selfPoison: z.tuple([z.number(), z.number()]).nullable(),
  selfPreventMove: z.number().nullable(),
  selfCustomDialogue: z.string().nullable(),

  // Enemy properties
  enemyDefenseMultiplier: z.tuple([z.number(), z.number()]).nullable(),
  enemyAttackMultiplier: z.tuple([z.number(), z.number()]).nullable(),
  enemyMoveEnergyMultiplier: z.tuple([z.number(), z.number()]).nullable(),
  enemyMoveEnergyGainMultiplier: z.tuple([z.number(), z.number()]).nullable(),
  enemyDesperationMultiplier: z.tuple([z.number(), z.number()]).nullable(),
  enemyDefenseScalarBoost: z.tuple([z.number(), z.number()]).nullable(),
  enemyAttackScalarBoost: z.tuple([z.number(), z.number()]).nullable(),
  enemyMoveEnergyScalarBoost: z.tuple([z.number(), z.number()]).nullable(),
  enemyMoveEnergyGainScalarBoost: z.tuple([z.number(), z.number()]).nullable(),
  enemyDesperationScalarBoost: z.tuple([z.number(), z.number()]).nullable(),
  enemyPoison: z.tuple([z.number(), z.number()]).nullable(),
  enemyPreventMove: z.number().nullable(),
  enemyCustomDialogue: z.string().nullable(),
});

/** Card move schema. */
export const CardMoveSchema = z.object({
  /** The card move ID. */
  id: z.number(),
  /** The associated move. */
  move: MoveSchema,
  /** The card move sprite URL, or null if using the card's default sprite. */
  sprite: z.string().nullable(),
});

/** Card schema. */
export const CardSchema = z.object({
  /** The card ID. */
  id: z.number(),
  /** The card name. */
  name: z.string(),
  /** The card nickname. */
  nickname: z.string(),
  /** The card description. */
  description: z.string(),
  /** The card default sprite URL. */
  defaultSprite: z.string(),
  /** The card audio URL, or null if no audio. */
  audio: z.string().nullable(),
  /** The card rarity. */
  rarity: RaritySchema,
  /** The card health. */
  health: z.number(),
  /** The card defense. */
  defense: z.number(),
  /** The card base move energy. */
  baseMoveEnergy: z.number(),
  /** The card base move energy gain. */
  baseMoveEnergyGain: z.number(),
  /** The card desperation threshold. */
  desperation: z.number(),
  /** The card moves. */
  moves: z.array(CardMoveSchema),
});

export type Rarity = z.infer<typeof RaritySchema>;
export type MoveDomain = z.infer<typeof MoveDomainSchema>;
export type Move = z.infer<typeof MoveSchema>;
export type CardMove = z.infer<typeof CardMoveSchema>;
export type Card = z.infer<typeof CardSchema>;

import { Brain, Building2, Calendar, Dumbbell, Flame, Heart, Leaf, Rocket, Sparkles, Zap, type LucideIcon } from "lucide-react"
import type { IconName } from "@/lib/strapi/types"

const ICONS: Record<IconName, LucideIcon> = {
  zap: Zap,
  flame: Flame,
  brain: Brain,
  sparkles: Sparkles,
  dumbbell: Dumbbell,
  building: Building2,
  calendar: Calendar,
  heart: Heart,
  leaf: Leaf,
  rocket: Rocket,
}

export function getIcon(name: IconName | null | undefined): LucideIcon {
  return (name && ICONS[name]) || Sparkles
}

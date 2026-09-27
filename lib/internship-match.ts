import type { InternshipMatchLevel, InternshipRoleDoc } from "@/lib/types";
import { idStr } from "@/lib/types";

export type SkillScoreMap = Map<string, number>;

export type RequirementResult = {
  skillId: string;
  skillName: string;
  minScore: number;
  studentScore: number | null;
  met: boolean;
  deficit: number;
};

export type RoleMatchResult = {
  roleId: string;
  title: string;
  summary: string;
  priority: number;
  metCount: number;
  requiredCount: number;
  matchPercent: number;
  level: InternshipMatchLevel;
  levelLabel: string;
  action: string;
  mainGap: string | null;
  requirements: RequirementResult[];
};

const LEVEL_LABEL: Record<InternshipMatchLevel, string> = {
  STRONG: "Strong Match",
  POTENTIAL: "Potential Match",
  DEVELOPING: "Developing Match",
  SIGNIFICANT: "Significant Gaps",
};

/**
 * Classify match from share of role requirements the student meets.
 * Fully explainable — no generative AI.
 */
export function classifyMatchLevel(metRatio: number): InternshipMatchLevel {
  if (metRatio >= 0.85) return "STRONG";
  if (metRatio >= 0.65) return "POTENTIAL";
  if (metRatio >= 0.45) return "DEVELOPING";
  return "SIGNIFICANT";
}

function buildAction(
  level: InternshipMatchLevel,
  mainGap: string | null,
  metCount: number,
  requiredCount: number
): string {
  if (requiredCount === 0) {
    return "This role has no skill requirements configured yet.";
  }
  if (level === "STRONG") {
    return mainGap
      ? `Strong fit overall. Optional polish: ${mainGap}.`
      : "Requirements are largely met — a transparent strong match for this configured role.";
  }
  if (mainGap) {
    return `Recommended action: improve ${mainGap} before applying (${metCount}/${requiredCount} requirements met).`;
  }
  return `${metCount}/${requiredCount} requirements met against this role’s configured skill floors.`;
}

/**
 * Score one internship role against the student’s normalized skill scores (0–100).
 * Missing / skipped skills count as unmet (score null → 0 for deficit).
 */
export function matchStudentToRole(
  role: InternshipRoleDoc,
  scoreBySkill: SkillScoreMap,
  skillNameById: Map<string, string>
): RoleMatchResult {
  const requirements: RequirementResult[] = role.requirements.map((req) => {
    const skillId = idStr(req.skillId);
    const studentScore = scoreBySkill.has(skillId)
      ? (scoreBySkill.get(skillId) as number)
      : null;
    const effective = studentScore ?? 0;
    const met = studentScore !== null && studentScore >= req.minScore;
    return {
      skillId,
      skillName: skillNameById.get(skillId) ?? "Unknown skill",
      minScore: req.minScore,
      studentScore,
      met,
      deficit: Math.max(0, req.minScore - effective),
    };
  });

  const requiredCount = requirements.length;
  const metCount = requirements.filter((r) => r.met).length;
  const metRatio = requiredCount === 0 ? 0 : metCount / requiredCount;
  const matchPercent = Math.round(metRatio * 100);
  const level = classifyMatchLevel(metRatio);

  const unmet = [...requirements]
    .filter((r) => !r.met)
    .sort((a, b) => b.deficit - a.deficit || a.skillName.localeCompare(b.skillName));
  const mainGap = unmet[0]?.skillName ?? null;

  return {
    roleId: idStr(role._id),
    title: role.title,
    summary: role.summary,
    priority: role.priority,
    metCount,
    requiredCount,
    matchPercent,
    level,
    levelLabel: LEVEL_LABEL[level],
    action: buildAction(level, mainGap, metCount, requiredCount),
    mainGap,
    requirements,
  };
}

/** Match all roles; sort by match strength then admin priority. */
export function matchStudentToRoles(
  roles: InternshipRoleDoc[],
  scoreBySkill: SkillScoreMap,
  skillNameById: Map<string, string>
): RoleMatchResult[] {
  const levelOrder: Record<InternshipMatchLevel, number> = {
    STRONG: 0,
    POTENTIAL: 1,
    DEVELOPING: 2,
    SIGNIFICANT: 3,
  };

  return roles
    .map((role) => matchStudentToRole(role, scoreBySkill, skillNameById))
    .sort(
      (a, b) =>
        levelOrder[a.level] - levelOrder[b.level] ||
        b.matchPercent - a.matchPercent ||
        a.priority - b.priority ||
        a.title.localeCompare(b.title)
    );
}

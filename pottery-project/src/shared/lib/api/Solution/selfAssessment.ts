export type CriteriaType = "POINTS" | "YES_NO" | "PERCENT";

export interface SelfAssessment{
    criterionId: string;
    title: string;
    valueType: CriteriaType;
    maxScore: string;
    pointsValue: string;
    booleanValue: boolean;
    percentValue: string;
}
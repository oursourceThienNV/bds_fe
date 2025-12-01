export class NewTargetKpi {
  month?: string;
  unitCode?: string;
  kpiType?: string;
  kpiCodes?: string[];
  kpiCode?: string;
  channels?: string[];
  channelCode?: string;
  levelTargetIds?: LevelTargetIds[];
  levelTargetIdsOld?: string;
}

export class LevelTargetIds {
  levelTargetIdView?: string;
  levelTargetId?: number;
  levelTargetName?: string;
}

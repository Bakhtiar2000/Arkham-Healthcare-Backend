export type TSchedule = {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
};

export type TFilterRequest = {
  start?: string | undefined;
  end?: string | undefined;
};

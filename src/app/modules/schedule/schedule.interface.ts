export type TSchedule = {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
};

export type TFilterRequest = {
  startDate?: string | undefined;
  endDate?: string | undefined;
};

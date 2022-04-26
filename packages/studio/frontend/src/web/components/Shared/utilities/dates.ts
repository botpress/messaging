import { dates, IDates } from 'common/dates'

import { lang } from '../translations'

const {
  lastMonthEnd,
  lastMonthStart,
  lastWeekEnd,
  lastWeekStart,
  lastYearEnd,
  lastYearStart,
  now,
  thisMonth,
  thisWeek,
  thisYear
} = dates

export const createDateRangeShortcuts = (): any[] => [
  {
    dateRange: [thisWeek, now],
    label: lang.tr('timespan.thisWeek')
  },
  {
    dateRange: [lastWeekStart, lastWeekEnd],
    label: lang.tr('timespan.lastWeek')
  },
  {
    dateRange: [thisMonth, now],
    label: lang.tr('timespan.thisMonth')
  },
  {
    dateRange: [lastMonthStart, lastMonthEnd],
    label: lang.tr('timespan.lastMonth')
  },
  {
    dateRange: [thisYear, now],
    label: lang.tr('timespan.thisYear')
  },
  {
    dateRange: [lastYearStart, lastYearEnd],
    label: lang.tr('timespan.lastYear')
  }
]

export const relativeDates = dates

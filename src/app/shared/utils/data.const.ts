//1. Loại giao
import  * as moment from 'moment';

export const ASSIGN_TYPES = [
  {name: 'assignType.withChanel', value: 1},
  {name: 'assignType.withoutChanel', value: 0},
]

export function convertDateToStartOfMonth(date, hour, minute, second) {
  return moment(date).startOf('month').format('YYYY-MM-DD hh:mm')
  return moment(date).startOf('month').format('YYYY-MM-DDT00:00:00.000+00:00')
}

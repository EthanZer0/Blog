// Original NoteHeaderDate: full date, medium weight and modified-date tooltip.
import { FloatPopover } from './FloatPopover';
import { MdiClockOutline } from './upstream/clock';
const fullDate = (date: string) => new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'Asia/Shanghai' }).format(new Date(date));
export default function NoteHeaderDate({ date, modified }: { date: string; modified?: string }) {
  const trigger = <span className="inline-flex items-center space-x-1"><MdiClockOutline /><time className="font-medium" dateTime={date}>{fullDate(date)}</time></span>;
  return modified ? <FloatPopover mobileAsSheet type="tooltip" triggerElement={trigger}>编辑于 {fullDate(modified)}</FloatPopover> : trigger;
}

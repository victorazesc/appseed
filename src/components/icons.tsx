import * as React from "react";

import { cn } from "@/lib/utils";

export type IconProps = React.SVGProps<SVGSVGElement>;

function SvgIcon({ className, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z" />
      <path d="M5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14z" />
      <path d="M18 12l.7 1.6 1.6.7-1.6.7L18 16l-.7-1.6L16 14l1.6-.7L18 12z" />
    </SvgIcon>
  );
}

export function RocketIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 2l4 4v5.5c0 1.8-.4 3.6-1.2 5.2L12 22l-2.8-5.3A11 11 0 018 11.5V6l4-4z" />
      <path d="M9.5 10.5h5" />
      <circle cx={12} cy={8.5} r={1.2} />
      <path d="M8 11.5L5.5 14" />
      <path d="M16 11.5L18.5 14" />
    </SvgIcon>
  );
}

export function TrendingUpIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 17l6-6 4 4 7-7" />
      <path d="M20 7h-5v5" />
    </SvgIcon>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx={12} cy={12} r={9} />
      <path d="M3 12h18" />
      <path d="M12 3a15.5 15.5 0 010 18" />
      <path d="M12 3a15.5 15.5 0 000 18" />
    </SvgIcon>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 4l8 4-8 4-8-4 8-4z" />
      <path d="M4 12l8 4 8-4" />
      <path d="M4 16l8 4 8-4" />
    </SvgIcon>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M10.5 13.5l-1 1a3.5 3.5 0 11-5-5l2.5-2.5a3.5 3.5 0 015 0" />
      <path d="M13.5 10.5l1-1a3.5 3.5 0 115 5l-2.5 2.5a3.5 3.5 0 01-5 0" />
      <path d="M9 15l6-6" />
    </SvgIcon>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3l8 3v6c0 5-3.2 8-8 9-4.8-1-8-4-8-9V6l8-3z" />
      <path d="M9.5 12.2l2.1 2.1 3.4-4.3" />
    </SvgIcon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx={11} cy={11} r={6} />
      <path d="M16 16l4 4" />
    </SvgIcon>
  );
}

export function PenToolIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3l6 6-6 12-6-12 6-6z" />
      <circle cx={12} cy={12} r={1.3} />
    </SvgIcon>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M13 2l-8 11h5l-1 9 8-12h-5l1-8z" />
    </SvgIcon>
  );
}

export function TestTubeIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M9 2h6" />
      <path d="M10 2v9.5c0 1.4-.4 2.8-1.2 4L7 18.8a2.8 2.8 0 104 4l1.7-1.7c.8-1.2 1.3-2.6 1.3-4.1V2" />
      <path d="M8.2 14h7.6" />
    </SvgIcon>
  );
}

export function CloudUploadIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M7.5 18a4.5 4.5 0 01-.4-9A6 6 0 1119 12h1a3.5 3.5 0 010 7h-4.5" />
      <path d="M12 12v7" />
      <path d="M9.5 14.5L12 12l2.5 2.5" />
    </SvgIcon>
  );
}

export function LineChartIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 18l5-6 3 3 6-7" />
      <path d="M20 5v4h-4" />
    </SvgIcon>
  );
}

export function CpuIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x={7} y={7} width={10} height={10} rx={2} />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <circle cx={12} cy={12} r={2.2} />
    </SvgIcon>
  );
}

export function ServerIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x={4} y={5} width={16} height={6} rx={1.5} />
      <rect x={4} y={13} width={16} height={6} rx={1.5} />
      <circle cx={8} cy={8} r={.8} fill="currentColor" stroke="none" />
      <circle cx={8} cy={16} r={.8} fill="currentColor" stroke="none" />
    </SvgIcon>
  );
}

export function CloudIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M7 18a4.5 4.5 0 010-9 6 6 0 1111.4 2.2A3.5 3.5 0 0117.5 18H7z" />
    </SvgIcon>
  );
}

export function SmartphoneIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x={8} y={2} width={8} height={20} rx={2} />
      <circle cx={12} cy={18} r={.8} fill="currentColor" stroke="none" />
    </SvgIcon>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx={9} cy={9} r={3} />
      <circle cx={16} cy={11} r={3} />
      <path d="M4 20a5 5 0 0110 0" />
      <path d="M14 20a5 5 0 016-4" />
    </SvgIcon>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx={12} cy={12} r={9} />
      <path d="M8.5 12.5l2.5 2.5 4.5-5.5" />
    </SvgIcon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7v6l4 2" />
    </SvgIcon>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3l2.7 5.4 6 1-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.4l6-1L12 3z" />
    </SvgIcon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x={3.5} y={5} width={17} height={14} rx={2} />
      <path d="M4 7l8 6 8-6" />
    </SvgIcon>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M5.5 3h4L11 7 9 8.5a10 10 0 006.5 6.5L17 13l4 1.5v4A2.5 2.5 0 0118.5 21 16.5 16.5 0 013 5.5 2.5 2.5 0 015.5 3z" />
    </SvgIcon>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z" />
      <circle cx={12} cy={10} r={2.5} />
    </SvgIcon>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 11l18-8-8 18-2-7-7-3z" />
      <path d="M11 13l5-5" />
    </SvgIcon>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12l7-7 7 7" />
    </SvgIcon>
  );
}

export function ListCheckIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M9 6h12" />
      <path d="M9 12h12" />
      <path d="M9 18h12" />
      <path d="M4.5 6.5l1.5 1.5 3-3" />
      <path d="M4.5 12.5l1.5 1.5 3-3" />
      <path d="M4.5 18.5l1.5 1.5 3-3" />
    </SvgIcon>
  );
}

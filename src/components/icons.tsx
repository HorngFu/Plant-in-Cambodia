type IconProps = { className?: string };

export function LeafIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 22c-.6 0-1-.4-1-1v-5.1C6.6 15.4 3 11.7 3 7V4a1 1 0 0 1 1-1h1c3.4 0 6.3 2 7.6 5A9 9 0 0 1 19 4h1a1 1 0 0 1 1 1v2c0 4.6-3.5 8.4-8 8.9V21c0 .6-.4 1-1 1Z" />
    </svg>
  );
}

export function WarningIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V9h2v4Z" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm0 10h6c-.5 3.7-2.9 7-6 8V12H6V6.3l6-2.2V12Z" />
    </svg>
  );
}

export function ExternalIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7ZM19 19H5V5h7V3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-7h-2v7Z" />
    </svg>
  );
}

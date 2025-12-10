import React from 'react';

interface PageShellProps {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
}

export function PageShell({ children, as: Tag = 'div' }: PageShellProps) {
  return (
    <Tag className="mx-auto max-w-[1400px] px-6 lg:px-10 py-8 lg:py-12 space-y-10">
      {children}
    </Tag>
  );
}

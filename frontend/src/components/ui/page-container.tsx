import type { ReactNode } from 'react';

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">{children}</div>;
}

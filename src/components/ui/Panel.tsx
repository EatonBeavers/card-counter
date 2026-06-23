import type { ReactNode } from 'react';

interface PanelProps {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, actions, children, className }: PanelProps): JSX.Element {
  return (
    <section className={`panel${className ? ` ${className}` : ''}`}>
      {(title || actions) && (
        <div className="panel-title">
          <span>{title}</span>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

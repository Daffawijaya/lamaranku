import type { ReactNode } from "react";

type Props = {
  caption: ReactNode;
  header: ReactNode;
  children: ReactNode;
  className?: string;
  tableClassName?: string;
};

/** Themed table surface. Consumers provide semantic header and body rows. */
export function DashboardTable({ caption, header, children, className = "", tableClassName = "" }: Props) {
  return <div className={`dash-ui-table-wrap ${className}`}>
    <table className={`dash-ui-table ${tableClassName}`}>
      <caption className="sr-only">{caption}</caption>
      <thead>{header}</thead>
      <tbody>{children}</tbody>
    </table>
  </div>;
}

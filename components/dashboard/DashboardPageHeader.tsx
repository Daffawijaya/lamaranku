export function DashboardPageHeader({
  title,
  description,
  label,
}: {
  title: string;
  description: string;
  label: string;
}) {
  return (
    <div className="dash-page-heading no-print">
      <span className="dash-kicker">{label}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

export function DashboardPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="dash-page-heading no-print">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

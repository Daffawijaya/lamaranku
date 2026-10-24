export function DashboardPageHeader({
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="workspace-page-heading print:hidden">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

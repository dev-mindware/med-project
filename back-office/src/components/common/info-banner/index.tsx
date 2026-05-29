type PropsBanner = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function InfoBanner({ title, description, children }: PropsBanner) {
  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
      <div className="px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
          <div className="w-full">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="w-full sm:w-max flex justify-center sm:justify-end">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

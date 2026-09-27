const TaxLookup = () => {
  return (
    <div className="min-h-screen">
      {/* Decorative header background */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-primary -z-10" />
      
      <div className="px-4 pt-4 pb-8">
        <div className="bg-card rounded-2xl p-5 shadow-lg">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Tra cứu hồ sơ khai thuế
          </h2>
          <p className="text-muted-foreground text-sm">
            Chức năng đang được phát triển...
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaxLookup;

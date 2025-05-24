interface TokenRowProps {
  title: string;
  value: string | number;
  extras?: string;
}
function TokenRow({ title, value, extras }: TokenRowProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <p className="text-sm font-medium text-secondary-foreground">{title}</p>
      <p className="text-sm font-medium text-gray-400">{value}</p>
      {extras && <p className="text-sm font-medium">{extras}</p>}
    </div>
  );
}

export default TokenRow;

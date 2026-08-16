export interface ChipOption {
  label: string;
  checked: boolean;
  onSelect: () => void;
}

interface ChipGroupProps {
  name: string;
  options: ChipOption[];
}

export function ChipGroup({ name, options }: ChipGroupProps) {
  return (
    <>
      {options.map((opt) => (
        <label className="baby-chip" key={opt.label}>
          <input type="radio" name={name} checked={opt.checked} onChange={opt.onSelect} />
          <span>{opt.label}</span>
        </label>
      ))}
    </>
  );
}

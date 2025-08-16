type Opt = { id: string; label: string };

const catalogs: Record<string, Opt[]> = {
  boolean_yes_no: [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
  ],
  license_types: [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
    { id: 'c', label: 'C' },
  ],
  login_methods: [
    { id: 'email',    label: 'Email' },
    { id: 'phone',    label: 'Phone' },
    { id: 'username', label: 'Username' },
  ],
};

export function resolveOptions(valuesSpec?: {
  source?: string;
  options?: Opt[];
}): Opt[] {
  if (!valuesSpec) return [];
  if (valuesSpec.options?.length) return valuesSpec.options;
  if (valuesSpec.source && catalogs[valuesSpec.source]) return catalogs[valuesSpec.source];
  return [];
}

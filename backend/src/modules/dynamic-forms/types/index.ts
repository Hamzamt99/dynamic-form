export type Comparator = '=' | '!=' | 'in' | 'not_in' | '>' | '>=' | '<' | '<=';
export type CompareAs = 'string' | 'number' | 'boolean';

export type Condition = {
  valueA: string;      
  valueB: string;    
  comparator: Comparator;
  compareAs?: CompareAs;
};

export type Field = {
  type: 'text' | 'radio' | 'select' | 'checkbox' | 'textLabel';
  identifier: string;
  label?: { locale?: Record<string,string> } | null;
  mandatory?: boolean;
  values?: { source?: string; options?: Array<{ id: string; label: string }> };
  condition?: Condition | null;
  reRenderOnUpdate?: string | string[]; 
};

export type Section = {
  type: 'section';
  identifier: string;
  title?: any;
  childs: Array<Field | Section>;
};

export type Step = {
  identifier: string;
  type: 'normalStep' | 'previewStep';
  title?: any;
  childs: Section[];
  submit?: any;
  nextStep?: string | null;
  prevStep?: string | null;
};

export type Workflow = Step[];
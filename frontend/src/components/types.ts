export type LocaleMap = Record<string, string>;

export type Condition = {
  valueA: string | number | boolean;
  valueB: string;
  comparator?: '=' | '!=' | 'in' | 'not_in' | '>' | '<' | '>=' | '<=';
  compareAs?: 'string' | 'number' | 'boolean';
};

type UIBase = {
  identifier: string;
  enabled?: boolean | string;
  condition?: Condition | null;
};

export type TextLabel = UIBase & {
  type: 'textLabel';
  text?: {
    icon?: string;
    align?: 'left' | 'right' | 'center';
    color?: any;
    style?: any;
    locale?: LocaleMap | string;
    parse_as?: 'html' | null;
  };
  border?: any;
  fullWidth?: boolean;
  background?: any;
};

export type OptionValueSource = {
  module?: string;
  source?: string; 
  parent?: string[];
  linked?: string[];
  options?: Array<{ id: string; label: string }>;
};

export type ListCellOptions = UIBase & {
  type: 'listCellOptions';
  label?: { locale?: LocaleMap };
  search?: { enabled?: boolean; placeholder?: { locale?: LocaleMap } };
  values?: OptionValueSource;
  editable?: boolean;
  autoSave?: boolean;
  mandatory?: boolean;
  fullscreen?: boolean;
  withIcons?: boolean;
  showAsSelect?: { enabled?: boolean; title?: { locale?: LocaleMap } };
  reRenderOnUpdate?: string;
  listTagsEnable?: boolean;
};

export type Button = UIBase & {
  type: 'button';
  text?: { locale?: LocaleMap; icon?: string; parse_as?: 'html' | null };
  stepRole?: { submit?: boolean; reset?: boolean; resetList?: string[] };
  target?: { webviewURL?: string; webviewInternal?: boolean; deeplink?: string };
  border?: any;
  background?: any;
};

export type Section = UIBase & {
  type: 'section' | 'mediaSection' | 'videoSection';
  title?: any;
  subTitle?: any;
  border?: any;
  background?: any;
  layout?: { columns?: number[]; direction?: 'rows' | 'columns' };
  childs?: Widget[];
  config?: Record<string, any>;
  mandatory?: boolean;
};

export type Separator = UIBase & {
  type: 'separator';
  line?: any;
  text?: any;
};
export type InputField = {
  type: 'input';
  identifier: string;
  label?: { locale?: LocaleMap };
  input?: { kind?: 'text' | 'email' | 'password' | 'number' | 'tel'; placeholder?: string };
  mandatory?: boolean;
  condition?: Condition | null;
};
export type Widget = TextLabel | ListCellOptions | Button | Section | Separator | InputField;

export type Step = {
  type: 'normalStep' | 'previewStep';
  identifier: string;
  uri?: string;
  title?: any;
  childs?: Section[];
  submit?: any;
  nextStep?: string | null;
  prevStep?: string | null;
  background?: any;
};


export type Workflow = Step[];

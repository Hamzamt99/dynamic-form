// src/components/FieldSwitch.tsx
'use client';

import * as React from 'react';
import {
  TextField, FormControl, FormLabel, Select, MenuItem,
  FormControlLabel, RadioGroup, Radio, Checkbox, Typography, Box, Button as MUIButton
} from '@mui/material';
import type { Button, ListCellOptions, Section, TextLabel, Widget } from './types';
import { resolveOptions } from './valueSources';
import { evaluateCondition } from './evaluators';
import { validateByJson, isEmpty, pickLocale, isGating } from './validators';

type Props = {
  node: Widget | Section;
  values: Record<string, any>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onSubmitStep?: () => void;
  forceShowErrors?: boolean;
  nextDisabled?: boolean;
};

function normalizeForValidation<T extends Record<string, any>>(n: T): T {
  if (!n || typeof n !== 'object') return n;
  const out: any = { ...n };
  if (out.mandotory !== undefined && out.mandatory === undefined) {

    out.mandatory = out.mandotory;
  }
  return out as T;
}

function requiredMsgOf(v?: any): string {
  return pickLocale(v?.messages?.required || v?.message, 'Required');
}

export default function FieldSwitch(props: Props): React.ReactNode {
  const { node, values, setValues, onSubmitStep, forceShowErrors, nextDisabled } = props;

  // SECTION (recurse)
  if (
    (node as Section).type === 'section' ||
    (node as Section).type === 'mediaSection' ||
    (node as Section).type === 'videoSection'
  ) {
    const sec = node as Section;
    if (sec.condition && !evaluateCondition(values, sec.condition)) return null;
    return (
      <Box sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', p: 2 }}>
        {sec.title?.locale?.en && (
          <Typography variant="h6" sx={{ mb: 1 }}>{sec.title.locale.en}</Typography>
        )}
        {(sec.childs ?? []).map((child) => (
          <Box key={child.identifier} sx={{ my: 1 }}>
            <FieldSwitch
              node={child}
              values={values}
              setValues={setValues}
              onSubmitStep={onSubmitStep}
              forceShowErrors={forceShowErrors}
              nextDisabled={nextDisabled}
            />
          </Box>
        ))}
      </Box>
    );
  }

  // TEXT LABEL
  if ((node as TextLabel).type === 'textLabel') {
    const tl = node as TextLabel;
    if (tl.condition && !evaluateCondition(values, tl.condition)) return null;
    const html = typeof tl.text?.locale === 'string' ? tl.text?.locale : tl.text?.locale?.en;
    return tl.text?.parse_as === 'html'
      ? <div dangerouslySetInnerHTML={{ __html: html ?? '' }} />
      : <Typography>{html}</Typography>;
  }

  // INPUT
  if ((node as any).type === 'input') {
    const f = node as any;
    if (f.condition && !evaluateCondition(values, f.condition)) return null;

    const val = values[f.identifier] ?? '';
    const [touched, setTouched] = React.useState(false);

    const err = validateByJson(values, normalizeForValidation(f), val);
    const showErr = (touched || !!forceShowErrors) && !!err;

    const kind: React.InputHTMLAttributes<unknown>['type'] = f.input?.kind ?? 'text';
    const v = f.validation ?? {};
    const inputProps: any = {};
    if (typeof v.maxLength === 'number') inputProps.maxLength = v.maxLength;
    if (typeof v.min === 'number') inputProps.min = v.min;
    if (typeof v.max === 'number') inputProps.max = v.max;
    if (kind === 'number') inputProps.inputMode = 'numeric';

    const helper = showErr ? err : (f.helper?.locale?.en ?? ' ');
    const requiredVisual = isGating(f);

    return (
      <TextField
        id={f.identifier}
        name={f.identifier}
        fullWidth
        type={kind}
        required={requiredVisual}
        label={f.label?.locale?.en ?? f.identifier}
        placeholder={f.input?.placeholder}
        value={val}
        error={showErr}
        helperText={helper}
        inputProps={inputProps}
        onChange={(e) => setValues(prev => ({ ...prev, [f.identifier]: e.target.value }))}
        onBlur={() => setTouched(true)}
      />
    );
  }

  // CHECKBOX
  if ((node as any).type === 'checkbox') {
    const f = node as any;
    if (f.condition && !evaluateCondition(values, f.condition)) return null;
    const checked = !!values[f.identifier];
    const [touched, setTouched] = React.useState(false);
    const requiredVisual = isGating(f);

    const v: any = f.validation ?? {};
    const err = requiredVisual && !checked ? requiredMsgOf(v) : null;
    const showErr = (touched || !!forceShowErrors) && !!err;

    return (
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={(e) => setValues(prev => ({ ...prev, [f.identifier]: e.target.checked }))}
              onBlur={() => setTouched(true)}
              name={f.identifier}
            />
          }
          label={f.label?.locale?.en ?? f.identifier}
        />
        <Typography variant="caption" color={showErr ? 'error' : 'transparent'}>
          {showErr ? err : (f.helper?.locale?.en ?? ' ')}
        </Typography>
      </Box>
    );
  }

  // LIST / SELECT
  if ((node as ListCellOptions).type === 'listCellOptions') {
    const field = node as ListCellOptions;
    if (field.condition && !evaluateCondition(values, field.condition)) return null;

    const opts = resolveOptions(field.values);
    const val = values[field.identifier] ?? '';
    const label = field.label?.locale?.en ?? field.identifier;
    const [touched, setTouched] = React.useState(false);
    const v: any = (field as any).validation ?? {};
    const requiredVisual = isGating(field);

    const requiredErr = requiredVisual && isEmpty(val) ? requiredMsgOf(v) : null;
    const showErr = (touched || !!forceShowErrors) && !!requiredErr;

    const forceSelect = field.showAsSelect?.enabled === true;
    const forceRadio  = field.showAsSelect?.enabled === false;
    const isBooleanish = opts.length === 2 && opts.every(o => ['yes','no','true','false'].includes(String(o.id).toLowerCase()));
    const smallSet = opts.length > 0 && opts.length <= 4;

    if (forceRadio || (!forceSelect && (isBooleanish || smallSet))) {
      return (
        <FormControl error={showErr}>
          <FormLabel required={requiredVisual}>{label}</FormLabel>
          <RadioGroup
            row
            value={val}
            onChange={(e) => setValues(prev => ({ ...prev, [field.identifier]: e.target.value }))}
            onBlur={() => setTouched(true)}
            name={field.identifier}
          >
            {opts.map(opt => (
              <FormControlLabel key={opt.id} value={opt.id} control={<Radio />} label={opt.label} />
            ))}
          </RadioGroup>
          <Typography variant="caption" color={showErr ? 'error' : 'transparent'}>
            {showErr ? requiredErr : ((field as any).helper?.locale?.en ?? ' ')}
          </Typography>
        </FormControl>
      );
    }

    return (
      <FormControl fullWidth error={showErr}>
        <FormLabel required={requiredVisual}>{label}</FormLabel>
        <Select
          id={field.identifier}
          name={field.identifier}
          value={val}
          displayEmpty
          onChange={(e) => setValues(prev => ({ ...prev, [field.identifier]: e.target.value }))}
          onBlur={() => setTouched(true)}
        >
          <MenuItem value="" disabled>Choose…</MenuItem>
          {opts.map(opt => (
            <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
          ))}
        </Select>
        <Typography variant="caption" color={showErr ? 'error' : 'transparent'}>
          {showErr ? requiredErr : ((field as any).helper?.locale?.en ?? ' ')}
        </Typography>
      </FormControl>
    );
  }

  // BUTTON inside schema
  if ((node as Button).type === 'button') {
    const btn = node as Button;
    if (btn.condition && !evaluateCondition(values, btn.condition)) return null;
    const text = typeof btn.text?.locale === 'string' ? btn.text?.locale : btn.text?.locale?.en;
    const isSubmit = !!btn.stepRole?.submit;
    return (
      <MUIButton
        variant={isSubmit ? 'contained' : 'outlined'}
        onClick={isSubmit ? onSubmitStep : undefined}
        disabled={isSubmit ? nextDisabled : false}
      >
        {text ?? 'Continue'}
      </MUIButton>
    );
  }

  // Fallback
  const anyNode = node as any;
  const val = values[anyNode.identifier] ?? '';
  const requiredVisual = isGating(anyNode);
  return (
    <TextField
      id={anyNode.identifier}
      name={anyNode.identifier}
      fullWidth
      required={requiredVisual}
      label={anyNode.label?.locale?.en ?? anyNode.identifier}
      value={val}
      onChange={(e) => setValues(prev => ({ ...prev, [anyNode.identifier]: e.target.value }))}
    />
  );
}

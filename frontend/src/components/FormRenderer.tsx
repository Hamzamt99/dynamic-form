// src/components/FormRenderer.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Stack,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  Divider,
  LinearProgress,
  Alert,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { Step as StepT, Workflow, Section } from './types';
import FieldSwitch from './FieldSwitch';
import { collectVisibleFieldNodes, validateByJson, isEmpty } from './validators';
import { useRouter } from 'next/navigation';
import type { StepIconProps } from '@mui/material/StepIcon';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

type Props = { workflow: Workflow; storageKey?: string };

const STORAGE_DEFAULT = 'form.flow';

function stepIsMandatory(step: any): boolean {
  const selfMandatory =
    step?.mandotory === true || step?.mandatory === true || step?.validation?.required === true;

  const anyMandatorySection = (function walk(nodes?: any[]): boolean {
    if (!Array.isArray(nodes)) return false;
    for (const n of nodes) {
      const isSection = ['section', 'mediaSection', 'videoSection'].includes(n?.type);
      const isMand =
        (typeof n?.mandotory === 'boolean' ? n.mandotory : n?.mandatory) === true ||
        n?.validation?.required === true;
      if (isSection && isMand) return true;
      if (walk(n?.childs)) return true;
    }
    return false;
  })(step?.childs);

  return selfMandatory || anyMandatorySection;
}

function StepDotIcon(props: StepIconProps) {
  const { active, completed, className } = props;
  return completed ? (
    <CheckCircleRoundedIcon fontSize="small" color="primary" className={className} />
  ) : (
    <RadioButtonUncheckedRoundedIcon
      fontSize="small"
      color={active ? 'primary' : 'disabled'}
      className={className}
    />
  );
}

function initialValuesFromWorkflow(workflow: Workflow): Record<string, any> {
  const out: Record<string, any> = {};
  const visit = (n: any) => {
    if (!n) return;
    if (n.condition) return; 
    if (n.type === 'input' || n.type === 'listCellOptions' || n.type === 'checkbox') {
      if (n.identifier && n.defaultValue !== undefined) out[n.identifier] = n.defaultValue;
      return;
    }
    if (n.childs?.length) n.childs.forEach(visit);
  };
  workflow.forEach(step => (step.childs ?? []).forEach(visit));
  return out;
}

export default function FormRenderer({ workflow, storageKey = STORAGE_DEFAULT }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  const [idx, setIdx] = React.useState(0);
  const [values, setValues] = React.useState<Record<string, any>>({});
  const [forceShowErrors, setForceShowErrors] = React.useState(false);

  const step: StepT = workflow[idx];
  const totalSteps = workflow.length;
  const labels = workflow.map(s => s.title?.locale?.en ?? s.identifier);
  const progress = Math.round(((idx + 1) / Math.max(1, totalSteps)) * 100);

  const bootedRef = React.useRef(false);
  React.useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    const defaults = initialValuesFromWorkflow(workflow);
    let savedVals: Record<string, any> | null = null;
    let savedIdx: number | null = null;
    try {
      savedVals = JSON.parse(localStorage.getItem(`${storageKey}:values`) || 'null');
      const i = localStorage.getItem(`${storageKey}:step`);
      savedIdx = i != null ? Number(i) : null;
    } catch {}
    setValues({ ...defaults, ...(savedVals ?? {}) });
    setIdx(Number.isFinite(savedIdx) ? (savedIdx as number) : 0);
  }, [workflow, storageKey]);

  // persist
  React.useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}:values`, JSON.stringify(values));
      localStorage.setItem(`${storageKey}:step`, String(idx));
    } catch {}
  }, [values, idx, storageKey]);

  // validation
  const { stepValid, firstErrorId } = React.useMemo(() => {
    const nodes = collectVisibleFieldNodes((step.childs ?? []) as unknown as (Section | any)[], values);

    for (const n of nodes) {
      const val = n.type === 'checkbox' ? !!values[n.identifier] : values[n.identifier];
      const err = validateByJson(values, n, val);
      if (err) return { stepValid: false, firstErrorId: n.identifier as string };
    }

    const mandatory = stepIsMandatory(step);
    if (!mandatory) return { stepValid: true, firstErrorId: null as string | null };

    if (!nodes.length) return { stepValid: false, firstErrorId: null as string | null };

    const hasAnyValue = nodes.some(n => !isEmpty(n.type === 'checkbox'
      ? !!values[n.identifier]
      : values[n.identifier]));
    if (!hasAnyValue) {
      return { stepValid: false, firstErrorId: nodes[0]?.identifier as string };
    }
    return { stepValid: true, firstErrorId: null as string | null };
  }, [step, values]);

  const goNext = () => {
    if (!stepValid) {
      setForceShowErrors(true);
      const el = document.querySelector(firstErrorId ? `[name="${firstErrorId}"], #${firstErrorId}` : '');
      if (el && 'scrollIntoView' in el) (el as any).scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setForceShowErrors(false);

    if (!step.nextStep) {
      try {
        localStorage.setItem(`${storageKey}:submission`, JSON.stringify(values));
      } catch {}
      router.push('/summary'); 
      return;
    }

    const nextIndex = workflow.findIndex(s => s.identifier === step.nextStep);
    if (nextIndex >= 0) setIdx(nextIndex);
  };

  const goPrev = () => {
    setForceShowErrors(false);
    if (!step.prevStep) return;
    const prevIndex = workflow.findIndex(s => s.identifier === step.prevStep);
    if (prevIndex >= 0) setIdx(prevIndex);
  };

  const nextLabel = step.nextStep ? (step.submit?.locale?.en ?? 'Continue') : 'Finish';

  return (
    <Box
      sx={{
        maxWidth: 960,
        mx: 'auto',
        px: { xs: 2, sm: 3 },
        pb: { xs: 7, sm: 8 }, 
      }}
    >
      {/* sticky progress bar */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: theme.zIndex.appBar, py: 1, bgcolor: 'background.default' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 999,
            '& .MuiLinearProgress-bar': { borderRadius: 999 },
          }}
        />
      </Box>

      {/* gradient hero */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mt: 2,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(135deg, rgba(25,118,210,0.06), rgba(156,39,176,0.06))',
        }}
      >
        <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 700, mb: 1 }}>
          {labels[idx]}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Step {idx + 1} of {totalSteps}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stepper
          activeStep={idx}
          alternativeLabel
          sx={{
            mb: 1,
            '& .MuiStepLabel-label': { typography: 'caption' },
          }}
          connector={null}
        >
          {labels.map((label, i) => (
            <Step key={i}>
              <StepLabel StepIconComponent={StepDotIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* form body */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {!stepValid && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please complete the required fields to continue.
          </Alert>
        )}

        <Stack spacing={2}>
          {(step.childs ?? []).map(sec => (
            <FieldSwitch
              key={sec.identifier}
              node={sec}
              values={values}
              setValues={setValues}
              onSubmitStep={goNext}
              forceShowErrors={forceShowErrors}
              nextDisabled={!stepValid}
            />
          ))}
        </Stack>
      </Paper>

      {/* sticky footer actions */}
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          bottom: 0,
          mt: 3,
          py: 1.5,
          px: { xs: 2, sm: 3 },
          borderTop: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(6px)',
          backgroundColor: 'background.paper',
          borderRadius: { xs: '12px 12px 0 0', sm: '12px' },
        }}
      >
        <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={1.5}>
          <Typography variant="caption" color="text.secondary">
            Progress: {progress}%
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackRoundedIcon />}
              disabled={!step.prevStep}
              onClick={goPrev}
              fullWidth={isMobile}
            >
              Back
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              disabled={!stepValid}
              onClick={goNext}
              fullWidth={isMobile}
            >
              {nextLabel}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CircularProgress, Box, Alert } from '@mui/material';
import FormRenderer from '@/components/FormRenderer';
import type { Workflow } from '@/components/types';

export default function WorkflowPage() {
  const params = useParams<{ workflowId: string }>();
  const id = params.workflowId;
  const [wf, setWf] = React.useState<Workflow | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    api.getWorkflow(id)
      .then(r => setWf(r.data))
      .catch(e => setErr(String(e)));
  }, [id]);

  if (err) return <Alert severity="error">{err}</Alert>;
  if (!wf) return <Box sx={{ display: 'grid', placeItems: 'center', height: 200 }}><CircularProgress /></Box>;

  return <FormRenderer workflow={wf} storageKey="register"/>;
}

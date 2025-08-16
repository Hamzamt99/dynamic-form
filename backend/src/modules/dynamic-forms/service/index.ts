import { q } from '../queries';
import { Workflow as WorkflowType } from '../types';
import { safeJsonParse, normalizeWorkflow } from '../helpers';

export class DynamicFormsService {
  async getWorkflow(workflowId: string): Promise<WorkflowType> {
    const row = await q.getWorkflowById(workflowId);
    if (!row) throw new Error('Workflow not found');
    const wf = safeJsonParse<WorkflowType>(row.json);
    return normalizeWorkflow(wf);
  }

  async upsertWorkflow(workflowId: string, json: unknown): Promise<void> {
    if (!Array.isArray(json)) throw new Error('Workflow JSON must be an array of steps');
    await q.upsertWorkflow(workflowId, JSON.stringify(json));
  }

  async listWorkflows() {
    const rows = await q.listWorkflows();
    return rows.map(r => ({ workflow_id: r.workflow_id, updated_at: String(r.updated_at) }));
  }
}

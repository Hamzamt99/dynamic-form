import { Workflow } from '../../../config/database';
import { loginArray, registerArray } from '../constants';

export const q = {
  async getWorkflowById(workflowId: string) {
    return Workflow.findOne({ where: { workflow_id: workflowId } });
  },

  async upsertWorkflow(workflowId: string, json: string) {
    await Workflow.upsert({ workflow_id: workflowId, json });
  },

  async listWorkflows() {
    return Workflow.findAll({
      attributes: ['workflow_id', 'updated_at'],
      order: [['workflow_id', 'ASC']],
    });
  },

  async count() {
    return Workflow.count();
  },

  async bulkSeed(rows: Array<{ workflow_id: string; json: string }>) {
    await Workflow.bulkCreate(rows, { ignoreDuplicates: true });
  },
};

export async function seedIfEmpty() {
  const c = await q.count();
  if (c > 0) return;

  const register = registerArray;
  const login = loginArray;
  // const post = postArray;

  await q.bulkSeed([
    { workflow_id: 'register', json: JSON.stringify(register) },
    { workflow_id: 'login',    json: JSON.stringify(login) },
    // { workflow_id: 'post',     json: JSON.stringify(post) },
  ]);
}

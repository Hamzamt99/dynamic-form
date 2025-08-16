import { Router, Request, Response } from 'express';
import { DynamicFormsService } from '../service';
import { sendResponse } from '../response';

export class DynamicFormsController {
  private service = new DynamicFormsService();
  private router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get('/:workflowId', this.getWorkflow);

    this.router.get('/', this.listWorkflows);

    this.router.post('/:workflowId', this.upsertWorkflow);
  }

  private getWorkflow = async (req: Request, res: Response) => {
    try {
      const { workflowId } = req.params;
      const data = await this.service.getWorkflow(workflowId);
      sendResponse(res, 200, 'OK', data);
    } catch (err) {
      sendResponse(res, 404, (err as Error).message);
    }
  };

  private listWorkflows = async (_req: Request, res: Response) => {
    try {
      const data = await this.service.listWorkflows();
      sendResponse(res, 200, 'OK', data);
    } catch (err) {
      sendResponse(res, 400, (err as Error).message);
    }
  };

  private upsertWorkflow = async (req: Request, res: Response) => {
    try {
      const { workflowId } = req.params;
      await this.service.upsertWorkflow(workflowId, req.body);
      sendResponse(res, 200, 'Saved');
    } catch (err) {
      sendResponse(res, 400, (err as Error).message);
    }
  };

  public getRouter(): Router {
    return this.router;
  }
}

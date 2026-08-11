import { User } from '@gigflow/shared';
import { IActivityTimeline } from '@gigflow/shared';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      leadActivityEvents?: IActivityTimeline[];
    }
  }
}

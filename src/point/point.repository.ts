import { UserPoint, PointHistory, TransactionType } from './point.model';

export interface PointRepository {
  getUserPoint(userId: number): Promise<UserPoint>;
  updateUserPoint(userId: number, newPoint: number): Promise<UserPoint>;
  insertHistory(
    userId: number,
    amount: number,
    type: TransactionType,
    time: number,
  ): Promise<PointHistory>;
  getHistories(userId: number): Promise<PointHistory[]>;
}

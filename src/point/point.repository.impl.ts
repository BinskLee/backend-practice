import { Injectable } from '@nestjs/common';
import { UserPointTable } from 'src/database/userpoint.table';
import { PointHistoryTable } from 'src/database/pointhistory.table';
import { PointRepository } from './point.repository';
import { UserPoint, TransactionType, PointHistory } from './point.model';

@Injectable()
export class PointRepositoryImpl implements PointRepository {
  constructor(
    private readonly userTable: UserPointTable,
    private readonly historyTable: PointHistoryTable,
  ) {}

  async getUserPoint(userId: number): Promise<UserPoint> {
    return this.userTable.selectById(userId);
  }

  async updateUserPoint(userId: number, newPoint: number): Promise<UserPoint> {
    return this.userTable.insertOrUpdate(userId, newPoint);
  }

  async insertHistory(
    userId: number,
    amount: number,
    type: TransactionType,
    time: number,
  ): Promise<PointHistory> {
    return this.historyTable.insert(userId, amount, type, time);
  }

  async getHistories(userId: number): Promise<PointHistory[]> {
    return this.historyTable.selectAllByUserId(userId);
  }
}

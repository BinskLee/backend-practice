import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserPointTable } from 'src/database/userpoint.table';
import { PointHistoryTable } from 'src/database/pointhistory.table';
import { TransactionType, UserPoint, PointHistory } from './point.model';

const MAX_POINT = 1_000_000;

@Injectable()
export class PointService {
  constructor(
    private readonly userDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
  ) {}

  async getUserPoint(userId: number): Promise<UserPoint> {
    return await this.userDb.selectById(userId);
  }

  async getPointHistories(userId: number): Promise<PointHistory[]> {
    return await this.historyDb.selectAllByUserId(userId);
  }

  async chargePoint(userId: number, amount: number): Promise<UserPoint> {
    const current = await this.userDb.selectById(userId);
    const next = current.point + amount;

    if (next > MAX_POINT) {
      throw new BadRequestException(
        `최대 포인트(${MAX_POINT})를 초과할 수 없습니다.`,
      );
    }

    const updated = await this.userDb.insertOrUpdate(userId, next);
    await this.historyDb.insert(
      userId,
      amount,
      TransactionType.CHARGE,
      updated.updateMillis,
    );

    return updated;
  }

  async usePoint(userId: number, amount: number): Promise<UserPoint> {
    const current = await this.userDb.selectById(userId);

    if (current.point < amount) {
      throw new BadRequestException('포인트가 부족합니다.');
    }

    const next = current.point - amount;
    const updated = await this.userDb.insertOrUpdate(userId, next);
    await this.historyDb.insert(
      userId,
      amount,
      TransactionType.USE,
      updated.updateMillis,
    );

    return updated;
  }
}

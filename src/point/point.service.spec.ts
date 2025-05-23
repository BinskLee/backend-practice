import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from './point.service';
import { PointHistoryTable } from 'src/database/pointhistory.table';
import { TransactionType } from './point.model';
import { BadRequestException } from '@nestjs/common';
import { UserPointTable } from 'src/database/userpoint.table';

describe('PointService', () => {
  let service: PointService;
  let userDb: UserPointTable;
  let historyDb: PointHistoryTable;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointService, UserPointTable, PointHistoryTable],
    }).compile();

    service = module.get(PointService);
    userDb = module.get(UserPointTable);
    historyDb = module.get(PointHistoryTable);
  });

  describe('포인트 충전', () => {
    it('포인트 충전이 정상적으로 진행되어야 한다.', async () => {
      const userId = 1;
      const chargeResult = await service.chargePoint(userId, 500);
      const result = await service.getUserPoint(userId);

      expect(result.point).toBe(500);

      const history = await service.getPointHistories(userId);
      expect(history.length).toBe(1);
      expect(history[0].type).toBe(TransactionType.CHARGE);
      expect(history[0].amount).toBe(500);
    });

    it('최대 포인트를 초과하면 예외를 던져야 한다.', async () => {
      const userId = 1;
      await service.chargePoint(userId, 900_000);
      await expect(service.chargePoint(userId, 200_000)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('포인트 사용', () => {
    it('포인트 사용이 정상적으로 진행되어야 한다.', async () => {
      const userId = 1;
      const chargeResult = await service.chargePoint(userId, 300);
      const result = await service.usePoint(userId, 200);

      expect(result.point).toBe(100);

      const history = await service.getPointHistories(userId);

      expect(history.length).toBe(2);
      expect(history[1].type).toBe(TransactionType.USE);
      expect(history[1].amount).toBe(200);
    });

    it('포인트가 부족하다면 예외를 던져야 한다', async () => {
      const userId = 1;
      const result = await service.chargePoint(userId, 100);
      await expect(service.usePoint(userId, 200)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('포인트 조회', () => {
    it('유저 포인트가 없다면 0을 반환해야 한다', async () => {
      const userId = 1;
      const result = await service.getUserPoint(userId);
      expect(result.id).toBe(userId);
      expect(result.point).toBe(0);
    });
  });

  describe('포인트 내역 조회', () => {
    it('히스토리가 없다면 빈 배열을 반환해야 한다.', async () => {
      const userId = 1;
      const history = await service.getPointHistories(userId);
      expect(history).toEqual([]);
    });
  });
});

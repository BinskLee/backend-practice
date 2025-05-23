import { Test, TestingModule } from '@nestjs/testing';
import { PointRepositoryImpl } from './point.repository.impl';
import { UserPointTable } from 'src/database/userpoint.table';
import { PointHistoryTable } from 'src/database/pointhistory.table';
import { TransactionType } from './point.model';

describe('PointRepositoryImpl', () => {
  let repository: PointRepositoryImpl;
  let userTable: UserPointTable;
  let historyTable: PointHistoryTable;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointRepositoryImpl, UserPointTable, PointHistoryTable],
    }).compile();

    repository = module.get(PointRepositoryImpl);
    userTable = module.get(UserPointTable);
    historyTable = module.get(PointHistoryTable);
  });

  describe('유저 포인트 가져오기', () => {
    it('존재하지 않는 유저는 초기 포인트 0으로 조회된다', async () => {
      const result = await repository.getUserPoint(1);
      expect(result.id).toBe(1);
      expect(result.point).toBe(0);
    });
  });

  describe('유저 포인트 저장', () => {
    it('포인트를 저장하면 해당 유저의 정보가 갱신된다', async () => {
      const result = await repository.updateUserPoint(2, 1000);
      expect(result.point).toBe(1000);

      const loaded = await repository.getUserPoint(2);
      expect(loaded.point).toBe(1000);
    });
  });

  describe('포인트 히스토리 저장', () => {
    it('히스토리를 저장하면 ID가 부여되고 타입과 값이 올바르게 저장된다', async () => {
      const now = Date.now();
      const history = await repository.insertHistory(
        3,
        500,
        TransactionType.CHARGE,
        now,
      );

      expect(history.userId).toBe(3);
      expect(history.amount).toBe(500);
      expect(history.type).toBe(TransactionType.CHARGE);
      expect(history.timeMillis).toBe(now);
      expect(history.id).toBeDefined();
    });
  });

  describe('히스토리 가져오기', () => {
    it('히스토리를 조회하면 해당 유저의 전체 내역이 반환된다', async () => {
      const now = Date.now();
      await repository.insertHistory(4, 100, TransactionType.CHARGE, now);
      await repository.insertHistory(4, -50, TransactionType.USE, now + 100);

      const histories = await repository.getHistories(4);
      expect(histories).toHaveLength(2);
      expect(histories[0].amount).toBe(100);
      expect(histories[1].amount).toBe(-50);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';

describe('StripeService', () => {
  let service: StripeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),   // .envを読み込む
      ],
      providers: [StripeService],
    }).compile();

    service = module.get<StripeService>(StripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Just run function', async () => {
    // サービスメソッドを実行し、結果を変数に格納します
    const result = await service.listProducts();

    // 1. 戻り値がStripeのリストオブジェクトであることを確認
    expect(result).toHaveProperty('object', 'list');
    expect(result).toHaveProperty('data');
    expect(Array.isArray(result.data)).toBe(true);

    // 2. data配列の件数が1件以上であることを確認 (メインのアサーション)
    expect(result.data.length).toBeGreaterThanOrEqual(1);

    // 3. (オプション) 最初の要素が 'product' オブジェクトであることを確認
    if (result.data.length > 0) {
        expect(result.data[0]).toHaveProperty('object', 'product');
    }
  })
});

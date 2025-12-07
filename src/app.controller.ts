import { Controller, Get, Body, Post, Request } from '@nestjs/common';
import { AppService } from './app.service';
import Stripe from 'stripe';
import { StripeService } from './stripe/stripe.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * helloを返すメソッド
   * @returns 
   */
  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * 商品一覧を取得するメソッド
   * @returns 
   */
  @Get('products')
  listProduct(): Promise<Stripe.Product[]> {
    return this.stripeService.listAllProcucts()
  }

  /**
   * Stripe Checkout Sessionを作成するメソッド
   * @param req 
   * @param body 
   * @returns 
   */
  @Post('checkout')
  createCheckoutSession(
    @Request() req,
    @Body() body: {
      price_id: string;
    }
  ) {
    const origin = req.headers.origin;
    return this.stripeService.createCheckoutSession(body.price_id, origin)
  }
}

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import Stripe from 'stripe';
import { StripeService } from './stripe/stripe.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly stripeService: StripeService,
  ) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('products')
  listProduct(): Promise<Stripe.Product[]> {
    return this.stripeService.listAllProcucts()
  }
}

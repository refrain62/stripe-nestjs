import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-11-17.clover',
    })
  }

  /**
   * List product that registered in Stripe
   * @returns 
   */
  public async listProducts() {
      return this.stripe.products.list()
  }

  /**
   * 商品を全て取得するメソッド
   * ※ 101件以上のデータがある場合は has_more が true になるため、再帰的に全件取得する
   * @param products 
   * @param startingAfter 
   * @returns 
   */
  public async listAllProcucts(products: Stripe.Product[] = [], startingAfter?: string): Promise<Stripe.Product[]> {
    const { data, has_more } = await this.stripe.products.list({
      starting_after: startingAfter,
    })

    const mergeProducts = Array.from(new Set([...products, ...data]))
    if (!has_more) {
      return mergeProducts
    }

    const finalProduct = data[data.length - 1]
    return this.listAllProcucts(mergeProducts, finalProduct.id)
  }
}

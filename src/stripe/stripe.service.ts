import { Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';

/**
 * Productに価格情報を追加した型
 */
export type ProductWithPrices = Stripe.Product & {
  prices: Stripe.Price[]
}

/**
 * Stripeを操作するサービス
 */
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
      // 商品に対する価格情報も取得して返す
      const items = await Promise.all(mergeProducts.map(async product => {
        return this.listProductPrice(product)
      }))
      return items
    }

    const finalProduct = data[data.length - 1]
    return this.listAllProcucts(mergeProducts, finalProduct.id)
  }

  /**
   * 商品に対する価格情報を取得する
   * @param product 
   * @returns 
   */
  public async listProductPrice(product: Stripe.Product): Promise<ProductWithPrices> {
    const { data: prices } = await this.stripe.prices.list({
      product: product.id
    })
    const item: ProductWithPrices = {
      ...product,
      prices
    }
    
    return item
  }

  /**
   * Checkout Sessionを作成する
   * @param priceId 
   * @param redirectUrl 
   * @returns 
   */
  public async createCheckoutSession(priceId: string, redirectUrl: string) {
    const price = await this.stripe.prices.retrieve(priceId)
    if (!price) {
      throw new NotFoundException('Price not found')
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: price.type === 'recurring' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price: price.id,
        quantity: 1
      }],
      cancel_url: `${redirectUrl}/cancel.html`,
      success_url: `${redirectUrl}/success.html`,
    })
    return session
  }
}

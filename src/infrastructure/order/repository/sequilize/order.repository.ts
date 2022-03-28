import { Model } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  
  async update(order: Order): Promise<void> {

    const filter = {
      where: {
        id: order.id
      }
    };

    let orderDB = await OrderModel.findOne(filter);

    const orderToUpdate = {
      customer_id: order.customerId,
      total: order.total()
    };

    if(orderDB) {

      for(const i of order.items) {
        await OrderItemModel.destroy( 
          {
            where: {
              id: i.id
            }
          });
        await OrderItemModel.create({
            id: i.id,
            name: i.name,
            price: i.price,
            product_id: i.productId,
            quantity: i.quantity,
            order_id: order.id
          }
        );
      }
      
      await OrderModel.update(
        orderToUpdate,
        filter
      ).catch(err =>{
        console.log(err);
     });

    }

  }
  
  async find(id: string): Promise<Order> {
    const orderModel = await OrderModel.findOne({
      where: { id: id },
      include: ["items"],
    });
    
    const items: OrderItem[] = orderModel.items.map((item) => (
      new OrderItem(
        item.id,
        item.name,
        item.price,
        item.id,
        item.quantity
      )
    ));
    const order: Order = new Order(orderModel.id, orderModel.customer_id, items);
    
    return order;
  }
  async  findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({
      include: ["items"],
    });


    const orders: Order[] = [];

    orderModels.forEach( 
      (o) => { 
        const items: OrderItem[] = o.items.map((item) => (
          new OrderItem(
            item.id,
            item.name,
            item.price,
            item.id,
            item.quantity
          )
        ));
        const order: Order = new Order(o.id, o.customer_id, items);
        orders.push(order);
      }
    );

    return orders;
  }

  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    ).catch(err =>{
      console.log(err);
    });
  }
}

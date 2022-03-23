import { Model } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  
  async update(entity: Order): Promise<void> {

    const filter = {
      where: {
        id: entity.id
      }
    };

    let orderDB = await OrderModel.findOne(filter);

    const orderToUpdate = {
      id: entity.id,
      customer_id: '999',
      total: entity.total(),      
    };

    if(orderDB) {
      
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

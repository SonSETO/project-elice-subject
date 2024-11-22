import { Address } from 'src/address/entities/address.entity';
import { BaseTable } from 'src/common/entity/base-table.entity';
import { UserGender, UserRole } from 'src/common/utils/enum/user-enum';
import { Order } from 'src/order/entities/order.entity';

import { ProductUserLike } from 'src/product/entities/product-user-like.entity';
import { Product } from 'src/product/entities/product.entity';

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  userRole: UserRole;

  @Column({
    type: 'enum',
    enum: UserGender,
    default: null,
    nullable: false,
  })
  userGender: UserGender;

  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  addresses: Address[];

  @OneToMany(() => ProductUserLike, (pul) => pul.user)
  likedProducts: ProductUserLike[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Product, (product) => product.user, { cascade: true })
  products: Product[];
}

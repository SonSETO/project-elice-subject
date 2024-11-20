import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductUserLike } from './product-user-like.entity';
import { BaseTable } from 'src/common/entity/base-table.entity';

import { Images } from 'src/images/entities/image.entity';
import { OrderItem } from 'src/order/entities/order-item.entity';
import {
  CategoryName,
  ProductGender,
  ProductSize,
} from 'src/common/utils/enum/product-enum';
import { User } from 'src/users/entities/user.entity';
import { Expose } from 'class-transformer';

@Entity()
export class Product extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column()
  title: string;

  @Expose()
  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price: number;

  @Expose()
  @Column()
  description: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: ProductGender,
    default: null,
    nullable: false,
  })
  productGender: ProductGender;

  @Expose()
  @Column({
    type: 'enum',
    enum: CategoryName,
    default: null,
    nullable: false,
  })
  category: CategoryName;

  @Expose()
  @Column({
    type: 'enum',
    enum: ProductSize,
    default: null,
    nullable: false,
  })
  size: ProductSize;

  @Expose()
  @Column({
    default: 0,
  })
  likeCount: number;

  @Expose()
  @OneToMany(() => ProductUserLike, (pul) => pul.product)
  likedUsers: ProductUserLike[];

  @Expose()
  @OneToMany(() => Images, (images) => images.product, {
    cascade: true,
  })
  images: Images[];

  @Expose()
  @OneToMany(() => Images, (images) => images.product, { cascade: true })
  orderItems: OrderItem[];

  @Expose()
  @ManyToOne(() => User, (user) => user.products, { onDelete: 'CASCADE' })
  user: User;
}

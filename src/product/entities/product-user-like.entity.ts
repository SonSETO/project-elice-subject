import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from './product.entity';
import { BaseTable } from 'src/common/entity/base-table.entity';

@Entity()
export class ProductUserLike extends BaseTable {
  @PrimaryColumn({
    name: 'productId',
    type: 'int8',
  })
  @ManyToOne(() => Product, (product) => product.likedUsers)
  product: Product;

  @PrimaryColumn({
    name: 'userId',
    type: 'int8',
  })
  @ManyToOne(() => User, (user) => user.likedProducts)
  user: User;

  @Column()
  isLike: boolean;
  // 애가 트루면 좋아요 상태
}

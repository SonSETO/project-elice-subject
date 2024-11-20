import { BaseTable } from 'src/common/entity/base-table.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Address extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recipientName: string;

  @Column()
  contactNumber: string;

  @Column()
  addressName: string;

  @Column()
  address: string;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  user: User;

  @Column({ default: false })
  isDefault: boolean;
}

/*
이놈은 고민좀
@Column()
  postalCode: string;

*/

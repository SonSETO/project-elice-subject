// import { CustomRepository } from 'src/common/custom-repository.decorator';
// import { Repository } from 'typeorm';
// import { ProductUserLike } from './entities/product-user-like.entity';

// @CustomRepository(ProductUserLike)
// export class ProductUserLikeRepository extends Repository<ProductUserLike> {
//   async findLikeRecord(
//     productId: number,
//     userId: number,
//   ): Promise<ProductUserLike | null> {
//     return this.findOne({
//       where: { product: { id: productId }, user: { id: userId } },
//     });
//   }

//   async toggleLike(
//     productId: number,
//     userId: number,
//     isLike: boolean,
//   ): Promise<number> {
//     const likeRecord = await this.findLikeRecord(productId, userId);

//     if (likeRecord && likeRecord.isLike === isLike) {
//       await this.remove(likeRecord);
//       return -1;
//     }

//     if (likeRecord) {
//       likeRecord.isLike = isLike;
//       await this.save(likeRecord);
//       return isLike ? 1 : -1;
//     }

//     await this.save({
//       product: { id: productId },
//       user: { id: userId },
//       isLike,
//     });

//     return 1;
//   }

//   async getLikedProductsByUser(userId: number): Promise<ProductUserLike[]> {
//     return this.createQueryBuilder('pul')
//       .leftJoinAndSelect('pul.product', 'product')
//       .where('pul.userId = :userId', { userId })
//       .andWhere('pul.isLike = :isLike', { isLike: true })
//       .getMany();
//   }
// }

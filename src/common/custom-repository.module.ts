import { DynamicModule, Provider } from '@nestjs/common';
import { CUSTOM_REPOSITORY } from './custom-repository.decorator';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/*
  구글링 복붙이긴 한데 map으로 돌리는 것도 있던데 그거 한번 찾아보기
  참고: https://eight20.tistory.com/128
 */

export class CustomRepositoryModule extends TypeOrmModule {
  public static forCustomRepository<T extends new (...args: any[]) => any>(
    repositories: T[],
  ): DynamicModule {
    const providers: Provider[] = [];

    for (const repository of repositories) {
      const entity = Reflect.getMetadata(CUSTOM_REPOSITORY, repository);

      if (!entity) {
        continue;
      }

      providers.push({
        inject: [getDataSourceToken()],
        provide: repository,
        useFactory: (dataSource: DataSource): typeof repository => {
          const baseRepository = dataSource.getRepository<any>(entity);
          return new repository(
            baseRepository.target,
            baseRepository.manager,
            baseRepository.queryRunner,
          );
        },
      });
    }

    return {
      exports: providers,
      module: CustomRepositoryModule,
      providers,
    };
  }
}

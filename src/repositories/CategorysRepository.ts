import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategorysRepository extends Repository<Category> {
  public async findByTitle(title: string): Promise<Category | undefined> {
    const findedCategory = await this.findOne({
      where: { title },
    });

    return findedCategory;
  }
}

export default CategorysRepository;

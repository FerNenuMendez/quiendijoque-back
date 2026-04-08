import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { Role } from '../common/enums/roles.enum';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  // Método para el Admin (crear categorías)
  async create(createCategoryDto: any): Promise<Category> {
    const newCategory = new this.categoryModel(createCategoryDto);
    return newCategory.save();
  }

  // Método estrella: Trae las categorías y calcula si están bloqueadas
  async findAllForUser(userRole: Role) {
    const categories = await this.categoryModel.find().exec();

    // Si es ADMIN o USERPLUS, tiene pase libre
    const hasPremiumAccess =
      userRole === Role.ADMIN || userRole === Role.USERPLUS;

    return categories.map((cat) => {
      const categoryObj = cat.toJSON();
      return {
        ...categoryObj,
        // Agregamos este flag dinámico para que el frontend sepa si dibujar el candado
        isLocked: !hasPremiumAccess && categoryObj.requiresPremium,
      };
    });
  }
}

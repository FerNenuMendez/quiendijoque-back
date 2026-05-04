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

  // Método estrella: ahora sabe si el usuario compró categorías
  async findAllForUser(userRole: Role, unlockedCategories: string[] = []) {
    const categories = await this.categoryModel.find().exec();

    // Si es ADMIN o USERPLUS, tiene pase libre
    const hasPremiumAccess =
      userRole === Role.ADMIN || userRole === Role.USERPLUS;

    return categories.map((cat) => {
      const categoryObj = cat.toJSON();

      // 🔥 FIX TYPE-SCRIPT: Mongoose siempre tiene _id, lo leemos directo del documento
      const catId = cat._id.toString();

      // LA MAGIA: ¿Está bloqueada?
      const isLocked =
        !hasPremiumAccess &&
        categoryObj.requiresPremium &&
        !unlockedCategories.includes(catId);

      return {
        ...categoryObj,
        isLocked,
      };
    });
  }
}

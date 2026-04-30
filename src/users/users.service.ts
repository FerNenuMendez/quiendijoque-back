/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from '../auth/dto/register.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailerService: MailerService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(userData: RegisterDto): Promise<User> {
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException(
        'El correo electrónico ya se encuentra registrado',
      );
    }

    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const newUser = new this.userModel({
      ...userData,
      verificationToken: token,
      isVerified: false,
    });

    await newUser.save();

    try {
      const url = `http://localhost:3000/auth/verify/${token}`;
      await this.mailerService.sendMail({
        to: newUser.email,
        subject: 'Confirma tu cuenta de ¿Quien Dijo Que?',
        html: `
          <h3>¡Hola ${newUser.name}!</h3>
          <p>Gracias por registrarte. Por favor, hacé clic en el siguiente enlace para activar tu cuenta:</p>
          <a href="${url}">Confirmar mi cuenta</a>
        `,
      });

      return newUser;
    } catch (error) {
      await this.userModel.findByIdAndDelete(newUser.id);
      throw new InternalServerErrorException(
        'Error al enviar el correo de confirmación. Por favor, intentá registrarte nuevamente.',
      );
    }
  }

  async verifyUserEmail(token: string): Promise<boolean> {
    const user = await this.userModel
      .findOne({ verificationToken: token })
      .exec();

    if (!user) {
      throw new NotFoundException('Token inválido o cuenta ya verificada');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return true;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async addPoints(userId: string, pointsToAdd: number): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $inc: { totalPoints: pointsToAdd } },
        { returnDocument: 'after' },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(
        'Usuario no encontrado al intentar actualizar puntos',
      );
    }

    return updatedUser;
  }

  // Actualizar el nombre de usuario
  async updateUsername(userId: string, newUsername: string) {
    // Verificamos que el nombre no esté en uso por otro jugador
    const existingUser = await this.userModel.findOne({
      username: newUsername,
    });
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException(
        'Ese nombre de usuario ya está en uso. Elegí otro.',
      );
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { username: newUsername },
        { returnDocument: 'after', runValidators: true },
      )
      .exec();

    return updatedUser;
  }

  // Método para comprar categorías
  async unlockCategory(userId: string, categoryId: string) {
    const COST = 500;

    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.unlockedCategories.includes(categoryId)) {
      throw new BadRequestException('Ya tenés esta categoría desbloqueada 🎸');
    }

    if (user.totalPoints < COST) {
      throw new BadRequestException(
        'No te alcanzan los puntos para esta categoría',
      );
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $inc: { totalPoints: -COST },
          $addToSet: { unlockedCategories: categoryId },
        },
        { returnDocument: 'after' },
      )
      .exec();

    if (!updatedUser) {
      throw new InternalServerErrorException(
        'Error al procesar la compra de la categoría',
      );
    }

    return {
      message: '¡Categoría desbloqueada con éxito!',
      remainingPoints: updatedUser.totalPoints,
      unlockedCategories: updatedUser.unlockedCategories,
    };
  }

  // 🔥 Guardar Avatar
  async updateAvatar(userId: string, avatarBase64: string) {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { avatar: avatarBase64 },
        { returnDocument: 'after' },
      )
      .exec();
    return updatedUser;
  }

  // Cambiar contraseña con validación
  async changePassword(userId: string, oldPass: string, newPass: string) {
    // Buscamos al usuario incluyendo explícitamente el password (si lo tenés oculto en el schema)
    const user = await this.userModel.findById(userId).exec();

    if (!user || !user.password) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Comparamos la vieja
    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }

    // Hasheamos la nueva
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPass, salt);
    await user.save();

    return { message: 'Contraseña actualizada con éxito' };
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/enums/roles.enum';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  collection: 'game_users',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret: any) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class User extends Document {
  @ApiProperty({
    example: '65f1...abc',
    description: 'ID único del usuario (UUID/ObjectId)',
  })
  id: string;

  @ApiProperty({
    example: 'fer@test.com',
    description: 'El correo del usuario',
  })
  @Prop({ unique: true, required: true })
  email: string;

  @Prop()
  password?: string;

  @Prop()
  googleId?: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'Nivel de acceso del usuario',
  })
  @Prop({
    type: String,
    enum: [Role.USER, Role.ADMIN, Role.USERPLUS],
    default: Role.USER,
  })
  role: Role;

  @ApiProperty({ example: 'Fernando Mendez', description: 'Nombre completo' })
  @Prop()
  name: string;

  @ApiProperty({
    example: 'https://avatar.com/u/123',
    description: 'URL de la imagen de perfil',
    required: false,
  })
  @Prop()
  avatar?: string;

  @ApiProperty({ description: 'Indica si el usuario validó su email' })
  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verificationToken?: string;

  @ApiProperty({
    example: 'Nenu_99',
    description: 'Nombre de usuario para mostrar en el juego',
  })
  @Prop({ unique: true, sparse: true })
  username?: string;

  @ApiProperty({
    example: 150,
    description: 'Puntos totales acumulados por el jugador',
  })
  @Prop({ default: 0 })
  totalPoints: number;

  // 🔥 NUEVO: Array para guardar las categorías desbloqueadas
  @ApiProperty({
    example: ['65f1a2b3c4d5e6f7a8b9c0d1'],
    description: 'IDs de las categorías premium que el usuario compró',
  })
  @Prop({ type: [String], default: [] })
  unlockedCategories: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

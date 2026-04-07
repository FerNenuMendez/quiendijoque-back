/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/enums/roles.enum';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  collection: 'cb_trv_users',
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
  password?: string; // Opcional porque si entra por Google no tendrá password manual

  @Prop()
  googleId?: string; // Para guardar el ID que nos mande Google

  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'Nivel de acceso del usuario',
  })
  @Prop({
    type: String,
    enum: [Role.USER, Role.ADMIN, Role.USERPLUS, Role.USEREXCEL],
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
}

export const UserSchema = SchemaFactory.createForClass(User);

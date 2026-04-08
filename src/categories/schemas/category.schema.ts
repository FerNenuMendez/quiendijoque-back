import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  collection: 'game_categories',
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
export class Category extends Document {
  @ApiProperty({ example: 'Rock Internacional', description: 'Nombre visible' })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({
    example: 'rock-internacional',
    description: 'Identificador para la URL',
  })
  @Prop({ required: true, unique: true })
  slug: string;

  @ApiProperty({
    example: false,
    description: '¿Es solo para usuarios Premium/Admin?',
  })
  @Prop({ default: false })
  requiresPremium: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'game_authors', timestamps: true })
export class Author extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  avatarUrl?: string;
}
export const AuthorSchema = SchemaFactory.createForClass(Author);

import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { CategorySchema } from './src/categories/schemas/category.schema';
import { AuthorSchema } from './src/quotes/schemas/author.schema';
import { QuoteSchema } from './src/quotes/schemas/quote.schema';

// Cargamos las variables de entorno para sacar la URL de Mongo
dotenv.config();

async function runSeed() {
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/quiendijoque';

  console.log('🔌 Conectando a la base de datos...');
  const connection = await mongoose.connect(mongoUri);
  console.log('✅ Conectado.');

  // Compilamos los modelos para poder usarlos
  const Category = mongoose.model('Category', CategorySchema);
  const Author = mongoose.model('Author', AuthorSchema);
  const Quote = mongoose.model('Quote', QuoteSchema);

  console.log('🧹 Limpiando colecciones anteriores...');
  await Category.deleteMany({});
  await Author.deleteMany({});
  await Quote.deleteMany({});

  console.log('🌱 Sembrando Categorías...');
  const catRock = await Category.create({
    name: 'Rock',
    slug: 'rock',
    requiresPremium: false,
  });
  const catCine = await Category.create({
    name: 'Cine y Series',
    slug: 'cine-y-series',
    requiresPremium: false,
  });
  const catFutbol = await Category.create({
    name: 'Leyendas del Fútbol',
    slug: 'futbol',
    requiresPremium: true,
  });
  const catSeries = await Category.create({
    name: 'Series de Tv',
    slug: 'series-de-tv',
    requiresPremium: true,
  });

  console.log('🎸 Sembrando Autores...');
  // Autores de Rock
  const charly = await Author.create({ name: 'Charly García' });
  const cerati = await Author.create({ name: 'Gustavo Cerati' });
  const indio = await Author.create({ name: 'Indio Solari' });
  const fito = await Author.create({ name: 'Fito Páez' }); // Distractor

  // Autores de Cine/Series
  const walter = await Author.create({ name: 'Walter White' });
  const darth = await Author.create({ name: 'Darth Vader' });
  const michael = await Author.create({ name: 'Michael Scott' });
  const tony = await Author.create({ name: 'Tony Soprano' }); // Distractor

  // Autores de Fútbol
  const gallardo = await Author.create({ name: 'Marcelo Gallardo' });
  const messi = await Author.create({ name: 'Lionel Messi' });
  const maradona = await Author.create({ name: 'Diego Maradona' });
  const labruna = await Author.create({ name: 'Ángel Labruna' }); // Distractor

  // Autores de Series de Tv
  const house = await Author.create({ name: 'Dr. Gregory House' });
  const sherlock = await Author.create({ name: 'Sherlock Holmes' });
  const daenerys = await Author.create({ name: 'Daenerys Targaryen' });
  const dexter = await Author.create({ name: 'Dexter Morgan' }); // Distractor

  console.log('💬 Sembrando Frases...');
  const quotes = [
    // Rock
    {
      text: 'La vanguardia es así.',
      authorId: charly._id,
      categoryId: catRock._id,
    },
    {
      text: 'Poder decir adiós es crecer.',
      authorId: cerati._id,
      categoryId: catRock._id,
    },
    {
      text: 'El lujo es vulgaridad.',
      authorId: indio._id,
      categoryId: catRock._id,
    },
    { text: 'Say no more.', authorId: charly._id, categoryId: catRock._id },

    // Cine y Series
    {
      text: 'I am the one who knocks.',
      authorId: walter._id,
      categoryId: catCine._id,
    },
    { text: 'I am your father.', authorId: darth._id, categoryId: catCine._id },
    {
      text: 'That is what she said.',
      authorId: michael._id,
      categoryId: catCine._id,
    },

    // Fútbol
    {
      text: 'Que la gente crea, porque tiene con qué creer.',
      authorId: gallardo._id,
      categoryId: catFutbol._id,
    },
    {
      text: 'Andá pa allá, bobo.',
      authorId: messi._id,
      categoryId: catFutbol._id,
    },
    {
      text: 'La pelota no se mancha.',
      authorId: maradona._id,
      categoryId: catFutbol._id,
    },
    {
      text: 'No me importa si ganamos o perdemos, me importa River.',
      authorId: labruna._id,
      categoryId: catFutbol._id,
    },

    // Series de Tv
    {
      text: 'Everybody lies.',
      authorId: house._id,
      categoryId: catSeries._id,
    },
    {
      text: 'The game is on.',
      authorId: sherlock._id,
      categoryId: catSeries._id,
    },
    {
      text: 'Dracarys.',
      authorId: daenerys._id,
      categoryId: catSeries._id,
    },
  ];

  await Quote.insertMany(quotes);

  console.log('✨ ¡Seed completado con éxito!');
  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error('❌ Error corriendo el seed:', err);
  process.exit(1);
});

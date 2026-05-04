import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { CategorySchema } from './src/categories/schemas/category.schema';
import { AuthorSchema } from './src/quotes/schemas/author.schema';
import { QuoteSchema } from './src/quotes/schemas/quote.schema';

// Cargamos las variables de entorno para sacar la URL de Mongo
dotenv.config();

// 🔥 DATA MAESTRA: 50 Frases por categoría estructuradas para escalar fácil
const SEED_DATA = [
  {
    category: { name: 'Rock', slug: 'rock', requiresPremium: false },
    authors: [
      {
        name: 'Charly García',
        quotes: [
          'La vanguardia es así.',
          'Say no more.',
          'Los dinosaurios van a desaparecer.',
          'El amor te hace estúpido.',
          'La mediocridad para algunos es normal.',
        ],
      },
      {
        name: 'Gustavo Cerati',
        quotes: [
          'Poder decir adiós es crecer.',
          'Siempre es hoy.',
          'Mereces lo que sueñas.',
          'Despiértame cuando pase el temblor.',
          'Usa el amor como un puente.',
        ],
      },
      {
        name: 'Indio Solari',
        quotes: [
          'El lujo es vulgaridad.',
          'Violencia es mentir.',
          'Vivir solo cuesta vida.',
          'Nuestro amo juega al esclavo.',
          'Fuego, mucho fuego.',
        ],
      },
      {
        name: 'Luis Alberto Spinetta',
        quotes: [
          'Mañana es mejor.',
          'No me dejes que me caiga.',
          'Tengo que aprender a volar.',
          'Todo dura un instante para toda la vida.',
          'Aunque me fuercen yo nunca voy a decir.',
        ],
      },
      {
        name: 'Andrés Calamaro',
        quotes: [
          'Flaca, no me claves tus puñales.',
          'No se puede vivir del amor.',
          'Voy a escribir un guion para mi propia vida.',
          'Te quiero igual.',
          'Hace calor, hace calor.',
        ],
      },
      {
        name: 'Pappo',
        quotes: [
          'El rock es una forma de vida.',
          'Nadie se atreva a tocar a mi vieja.',
          'Juntos a la par.',
          'Que sea rock.',
          'Buscando un amor.',
        ],
      },
      {
        name: 'Freddie Mercury',
        quotes: [
          "I won't be a rock star. I will be a legend.",
          'The show must go on.',
          'I want to break free.',
          'We are the champions, my friends.',
          'I am a romantic, but I do put up a barrier.',
        ],
      },
      {
        name: 'John Lennon',
        quotes: [
          "Life is what happens to you while you're busy making other plans.",
          'Imagine all the people living life in peace.',
          'All you need is love.',
          'Reality leaves a lot to the imagination.',
          'A dream you dream alone is only a dream.',
        ],
      },
      {
        name: 'Kurt Cobain',
        quotes: [
          'Come as you are, as you were.',
          "It's better to burn out than to fade away.",
          "I'd rather be hated for who I am.",
          'Nobody dies a virgin, life f*cks us all.',
          "Just because you're paranoid doesn't mean they aren't after you.",
        ],
      },
      {
        name: 'Mick Jagger',
        quotes: [
          "You can't always get what you want.",
          "I know it's only rock 'n roll but I like it.",
          "Wild horses couldn't drag me away.",
          'Paint it black.',
          'Time is on my side.',
        ],
      },
    ],
  },
  {
    category: { name: 'Cine', slug: 'cine', requiresPremium: false },
    authors: [
      {
        name: 'Darth Vader',
        quotes: [
          'I am your father.',
          'I find your lack of faith disturbing.',
          'The force is strong with this one.',
          "You don't know the power of the dark side.",
          'No disintegrations.',
        ],
      },
      {
        name: 'Vito Corleone',
        quotes: [
          "I'm gonna make him an offer he can't refuse.",
          "A man who doesn't spend time with his family can never be a real man.",
          'Look how they massacred my boy.',
          'Women and children can be careless, but not men.',
          'I never wanted this for you, Michael.',
        ],
      },
      {
        name: 'Terminator',
        quotes: [
          "I'll be back.",
          'Hasta la vista, baby.',
          'Come with me if you want to live.',
          'I need your clothes, your boots, and your motorcycle.',
          'It is in your nature to destroy yourselves.',
        ],
      },
      {
        name: 'Forrest Gump',
        quotes: [
          'My mama always said life was like a box of chocolates.',
          'Stupid is as stupid does.',
          'Run, Forrest, run!',
          "I'm not a smart man, but I know what love is.",
          "And that's all I have to say about that.",
        ],
      },
      {
        name: 'Tyler Durden',
        quotes: [
          'The first rule of Fight Club is: you do not talk about Fight Club.',
          'The things you own end up owning you.',
          "It's only after we've lost everything that we're free to do anything.",
          'We are a generation of men raised by women.',
          "This is your life, and it's ending one minute at a time.",
        ],
      },
      {
        name: 'Travis Bickle',
        quotes: [
          "You talkin' to me?",
          'Someday a real rain will come and wash all this scum off the streets.',
          "I'm God's lonely man.",
          'I got some bad ideas in my head.',
          'Here is a man who would not take it anymore.',
        ],
      },
      {
        name: 'Indiana Jones',
        quotes: [
          "It's not the years, honey. It's the mileage.",
          'Snakes. Why did it have to be snakes?',
          'It belongs in a museum!',
          'X never, ever marks the spot.',
          'Trust me.',
        ],
      },
      {
        name: 'Rocky Balboa',
        quotes: [
          "It ain't about how hard you hit.",
          'Every champion was once a contender who refused to give up.',
          'If I can change, and you can change, everybody can change!',
          'Nobody owes nobody nothing.',
          'Keep moving forward.',
        ],
      },
      {
        name: 'Dr. Emmett Brown',
        quotes: [
          'Great Scott!',
          "Roads? Where we're going, we don't need roads.",
          '1.21 Gigawatts!',
          'Your future is whatever you make it.',
          'If my calculations are correct...',
        ],
      },
      {
        name: 'Hannibal Lecter',
        quotes: [
          'A census taker once tried to test me. I ate his liver with some fava beans and a nice Chianti.',
          'Hello, Clarice.',
          'Quid pro quo.',
          'Have the lambs stopped screaming?',
          'We begin by coveting what we see every day.',
        ],
      },
    ],
  },
  {
    category: {
      name: 'Leyendas del Fútbol',
      slug: 'futbol',
      requiresPremium: true,
    },
    authors: [
      {
        name: 'Marcelo Gallardo',
        quotes: [
          'Que la gente crea, porque tiene con qué creer.',
          'Cierren los ojos, e imagínense si la perdíamos.',
          'Nada más que esto, no hay nada más.',
          'El que no cree, que no venga.',
          'Napoleón no soy, soy Marcelo.',
        ],
      },
      {
        name: 'Ángel Labruna',
        quotes: [
          'No me importa si ganamos o perdemos, me importa River.',
          'Yo a Boca no lo odio, lo compadezco.',
          'La banda roja es un sentimiento.',
          'Si dirijo a Boca, me voy al descenso.',
          'River es noticia siempre.',
        ],
      },
      {
        name: 'Ramón Díaz',
        quotes: [
          'Je, y... es para la gente de Boca que lo mira por TV.',
          'Yo no me fui al descenso.',
          'Los bosteros están nerviosos.',
          '¿Vieron qué lindo es jugar en el Monumental?',
          'A River lo llevo en el corazón.',
        ],
      },
      {
        name: 'Enzo Francescoli',
        quotes: [
          'La camiseta de River te exige ganar.',
          'Jugar en el Monumental lleno no tiene comparación.',
          'Siempre traté de jugar al fútbol con alegría.',
          'El fútbol es el deporte más hermoso.',
          'River es mi casa.',
        ],
      },
      {
        name: 'Diego Maradona',
        quotes: [
          'La pelota no se mancha.',
          'Me cortaron las piernas.',
          'Seguís siendo el rey de la chanchería.',
          'Lástima a nadie.',
          'El gol a los ingleses lo hizo la mano de Dios.',
        ],
      },
      {
        name: 'Lionel Messi',
        quotes: [
          'Andá pa allá, bobo.',
          'Ya está, se terminó.',
          'Este equipo no los va a dejar tirados.',
          'Prefiero ganar títulos con el equipo antes que premios individuales.',
          'Fue el partido más sufrido que me tocó jugar.',
        ],
      },
      {
        name: 'Emiliano "Dibu" Martínez',
        quotes: [
          'Mirá que te como, hermano.',
          'Le hice upa.',
          'No me temblaron las piernas.',
          'Es un sueño cumplido.',
          'Yo sé que me gustan los penales.',
        ],
      },
      {
        name: 'Juan Román Riquelme',
        quotes: [
          "Estoy feli'.",
          'La pelota me la dio mi mamá.',
          'En la Bombonera la cancha se mueve.',
          'El hincha de Boca está loco.',
          'Seremos menos malos que los demás.',
        ],
      },
      {
        name: 'Carlos Bilardo',
        quotes: [
          'Al enemigo, ni agua.',
          'Pisalo, pisalo.',
          'El fútbol es ganar y nada más.',
          'Los de colorado son los nuestros.',
          'Muchachos, no se la den a los de amarillo.',
        ],
      },
      {
        name: 'Pep Guardiola',
        quotes: [
          'El fútbol es un juego de engaños.',
          'No hay nada más arriesgado que no arriesgar.',
          'El secreto es tener el balón.',
          'Messi es el mejor de la historia.',
          'Yo perdono que no acierten, pero no perdono que no se esfuercen.',
        ],
      },
    ],
  },
  {
    category: {
      name: 'Series de Tv',
      slug: 'series-de-tv',
      requiresPremium: true,
    },
    authors: [
      {
        name: 'Walter White',
        quotes: [
          'I am the one who knocks.',
          'Say my name.',
          'I am in the empire business.',
          'Tread lightly.',
          "We're done when I say we're done.",
        ],
      },
      {
        name: 'Michael Scott',
        quotes: [
          "That's what she said.",
          'I am Beyoncé, always.',
          "I'm not superstitious, but I am a little stitious.",
          'Would I rather be feared or loved? Easy. Both.',
          'Bears, Beets, Battlestar Galactica.',
        ],
      },
      {
        name: 'Dr. Gregory House',
        quotes: [
          'Everybody lies.',
          "It's never lupus.",
          'If you can fake sincerity, you can fake anything.',
          "Normal's overrated.",
          'Patients are idiots.',
        ],
      },
      {
        name: 'Sherlock Holmes',
        quotes: [
          'The game is on.',
          "I'm not a psychopath, I'm a high-functioning sociopath.",
          'Brainy is the new sexy.',
          "Anderson, don't talk out loud. You lower the IQ of the whole street.",
          'Sentiment is a chemical defect found in the losing side.',
        ],
      },
      {
        name: 'Daenerys Targaryen',
        quotes: [
          'Dracarys.',
          "I am not going to stop the wheel, I'm going to break the wheel.",
          'I will take what is mine with fire and blood.',
          'A dragon is not a slave.',
          "Any man who must say 'I am the king' is no true king.",
        ],
      },
      {
        name: 'Tony Soprano',
        quotes: [
          'Those who want respect, give respect.',
          'A wrong decision is better than indecision.',
          "You're only as good as your last envelope.",
          'Even a broken clock is right twice a day.',
          'There is no Mafia.',
        ],
      },
      {
        name: 'Saul Goodman',
        quotes: [
          "It's all good, man!",
          "Lawyers: We're like health insurance.",
          "I am not a criminal lawyer, I'm a criminal lawyer.",
          'Perfection is the enemy of perfectly adequate.',
          "Let's get down to brass tacks.",
        ],
      },
      {
        name: 'Dexter Morgan',
        quotes: [
          "Tonight's the night.",
          'I love Halloween. The one time of year when everyone wears a mask, not just me.',
          'Blood never lies.',
          "Monsters don't get to live happily ever after.",
          "I'm a very neat monster.",
        ],
      },
      {
        name: 'Homero Simpson',
        quotes: [
          "¡D'oh!",
          'A la grande le puse Cuca.',
          'Marge, no voy a mentirte.',
          'Hable más fuerte que tengo una toalla.',
          'Cama arriba, cama abajo.',
        ],
      },
      {
        name: 'Tyrion Lannister',
        quotes: [
          'I drink and I know things.',
          'Never forget what you are.',
          'A Lannister always pays his debts.',
          'Death is so final, whereas life is full of possibilities.',
          "It's not easy being drunk all the time.",
        ],
      },
    ],
  },
];

async function runSeed() {
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/quiendijoque';

  console.log('🔌 Conectando a la base de datos...');
  const connection = await mongoose.connect(mongoUri);
  console.log('✅ Conectado.');

  const Category = mongoose.model('Category', CategorySchema);
  const Author = mongoose.model('Author', AuthorSchema);
  const Quote = mongoose.model('Quote', QuoteSchema);

  console.log('🧹 Limpiando colecciones anteriores...');
  await Category.deleteMany({});
  await Author.deleteMany({});
  await Quote.deleteMany({});

  console.log('🌱 Sembrando Categorías, Autores y 200 Frases de una...');

  // 🔥 Lógica de doble bucle: Recorremos la Data Maestra e insertamos todo automáticamente
  for (const catData of SEED_DATA) {
    const cat = await Category.create(catData.category);

    for (const authorData of catData.authors) {
      const author = await Author.create({ name: authorData.name });

      const quotesToInsert = authorData.quotes.map((text) => ({
        text,
        authorId: author._id,
        categoryId: cat._id,
      }));

      await Quote.insertMany(quotesToInsert);
    }
  }

  console.log('✨ ¡Seed de 200 frases completado con éxito!');
  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error('❌ Error corriendo el seed:', err);
  process.exit(1);
});

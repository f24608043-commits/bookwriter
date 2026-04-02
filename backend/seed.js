const { supabaseAdmin } = require('./supabase');

// Seed data for development
const seedDatabase = async () => {
  try {
    console.log('Seeding database...');

    // Insert sample genres
    const { data: genres, error: genreError } = await supabaseAdmin
      .from('genres')
      .upsert([
        { name: 'Fiction', description: 'Fictional stories and novels' },
        { name: 'Non-Fiction', description: 'Real-world stories and facts' },
        { name: 'Science Fiction', description: 'Futuristic and speculative fiction' },
        { name: 'Fantasy', description: 'Magical and fantastical stories' },
        { name: 'Romance', description: 'Love stories and relationships' },
        { name: 'Mystery', description: 'Suspenseful and mysterious tales' },
        { name: 'Biography', description: 'Life stories of real people' },
        { name: 'Self-Help', description: 'Personal development and improvement' },
      ])
      .select();

    if (genreError) {
      console.error('Error inserting genres:', genreError);
    } else {
      console.log('Genres seeded successfully');
    }

    // Insert sample books
    const { data: books, error: bookError } = await supabaseAdmin
      .from('books')
      .upsert([
        {
          title: 'The Digital Writer',
          description: 'A comprehensive guide to modern digital writing tools and techniques.',
          content: 'Chapter 1: Introduction to Digital Writing...',
          author_id: 'sample-author-1',
          genre: 'Non-Fiction',
          tags: ['writing', 'digital', 'technology'],
          published: true,
          created_at: new Date().toISOString(),
        },
        {
          title: 'Mysteries of Code',
          description: 'An exciting journey through the world of programming mysteries.',
          content: 'Chapter 1: The First Bug...',
          author_id: 'sample-author-2',
          genre: 'Science Fiction',
          tags: ['programming', 'mystery', 'technology'],
          published: true,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (bookError) {
      console.error('Error inserting books:', bookError);
    } else {
      console.log('Books seeded successfully');
    }

    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

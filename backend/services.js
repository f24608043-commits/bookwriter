const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Book services
const createBook = async (req, res) => {
  const { title, description, content, author_id, genre, tags } = req.body;

  try {
    const { data, error } = await supabase
      .from('books')
      .insert([
        {
          title,
          description,
          content,
          author_id,
          genre,
          tags,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Book created successfully', book: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getBooks = async (req, res) => {
  const { page = 1, limit = 10, genre, search } = req.query;

  try {
    let query = supabase
      .from('books')
      .select(`
        *,
        author:profiles(username, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (genre) {
      query = query.eq('genre', genre);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      books: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        author:profiles(username, avatar_url, bio),
        chapters:chapters(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ book: data });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateBook = async (req, res) => {
  const { id } = req.params;
  const { title, description, content, genre, tags } = req.body;

  try {
    const { data, error } = await supabase
      .from('books')
      .update({
        title,
        description,
        content,
        genre,
        tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Book updated successfully', book: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


// Profile services
const getProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile: data });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { username, bio, avatar_url, preferences } = req.body;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        username,
        bio,
        avatar_url,
        preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Profile updated successfully', profile: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase.rpc('delete_book', {
      p_book_id: id,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data.success) {
      return res.status(400).json({ error: data.message });
    }

    // Delete cover image from storage if exists
    if (data.message && data.message !== 'Book not found') {
      try {
        const coverPath = data.message.split('/').pop();
        if (coverPath) {
          const { error: storageError } = await supabaseAdmin.storage
            .from('book-covers')
            .remove([coverPath]);
          
          if (storageError) {
            console.warn('Failed to delete cover image:', storageError.message);
          }
        }
      } catch (storageError) {
        console.warn('Storage deletion error:', storageError);
      }
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteChapter = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase.rpc('delete_chapter', {
      p_chapter_id: id,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data.success) {
      return res.status(400).json({ error: data.message });
    }

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserBooks = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const { data, error } = await supabase.rpc('get_user_books', {
      p_limit: parseInt(limit),
      p_offset: offset,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ books: data });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  createChapter,
  getChapters,
  getChapterById,
  updateChapter,
  deleteChapter,
  getProfile,
  updateProfile,
  getUserBooks,
};

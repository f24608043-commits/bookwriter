-- Safe delete functions for BookWriter

-- Delete book with all related data
CREATE OR REPLACE FUNCTION delete_book(p_book_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    book_author UUID;
    book_cover TEXT;
BEGIN
    -- Get book author and cover URL
    SELECT author_id, cover_url INTO book_author, book_cover
    FROM books
    WHERE id = p_book_id;
    
    -- Check if book exists
    IF book_author IS NULL THEN
        RETURN QUERY SELECT false, 'Book not found'::TEXT;
        RETURN;
    END IF;
    
    -- Ensure only owner can delete
    IF book_author != auth.uid() THEN
        RETURN QUERY SELECT false, 'Only the author can delete this book'::TEXT;
        RETURN;
    END IF;
    
    -- Delete book (cascade will handle related records)
    DELETE FROM books WHERE id = p_book_id;
    
    -- Return success with cover URL for storage cleanup
    RETURN QUERY SELECT true, book_cover::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete chapter with all related data
CREATE OR REPLACE FUNCTION delete_chapter(p_chapter_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    chapter_book_author UUID;
BEGIN
    -- Get chapter's book author
    SELECT b.author_id INTO chapter_book_author
    FROM chapters c
    JOIN books b ON c.book_id = b.id
    WHERE c.id = p_chapter_id;
    
    -- Check if chapter exists
    IF chapter_book_author IS NULL THEN
        RETURN QUERY SELECT false, 'Chapter not found'::TEXT;
        RETURN;
    END IF;
    
    -- Ensure only book author can delete
    IF chapter_book_author != auth.uid() THEN
        RETURN QUERY SELECT false, 'Only the book author can delete this chapter'::TEXT;
        RETURN;
    END IF;
    
    -- Delete chapter (cascade will handle related records)
    DELETE FROM chapters WHERE id = p_chapter_id;
    
    -- Return success
    RETURN QUERY SELECT true, 'Chapter deleted successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete book cover from storage
CREATE OR REPLACE FUNCTION delete_book_cover(p_book_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    cover_path TEXT;
BEGIN
    -- Get book cover path
    SELECT cover_url INTO cover_path
    FROM books
    WHERE id = p_book_id AND author_id = auth.uid();
    
    -- Extract file path from URL
    IF cover_path IS NOT NULL THEN
        cover_path := regexp_replace(cover_path, '.*/', '');
        
        -- Delete from storage (this would need to be called from backend)
        -- storage.remove('book-covers', cover_path);
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's books for management
CREATE OR REPLACE FUNCTION get_user_books(p_user_id UUID DEFAULT auth.uid(), p_limit INTEGER DEFAULT 20, p_offset INTEGER DEFAULT 0)
RETURNS TABLE(
    id UUID,
    title TEXT,
    description TEXT,
    genre TEXT,
    published BOOLEAN,
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    chapters_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.title,
        b.description,
        b.genre,
        b.published,
        b.cover_url,
        b.created_at,
        b.updated_at,
        COUNT(c.id) as chapters_count
    FROM books b
    LEFT JOIN chapters c ON b.id = c.book_id
    WHERE b.author_id = p_user_id
    GROUP BY b.id, b.title, b.description, b.genre, b.published, b.cover_url, b.created_at, b.updated_at
    ORDER BY b.updated_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json()
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // Get current post
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, views')
      .eq('slug', slug)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Increment view count
    const { error: updateError } = await supabase
      .from('posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', post.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update views' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json()
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    
    // Check if this IP viewed this post in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: existingView } = await supabase
      .from('post_views')
      .select('id')
      .eq('post_slug', slug)
      .eq('ip_address', ip)
      .gte('created_at', oneDayAgo)
      .single()

    // If already viewed by this IP in last 24 hours, don't count again
    if (existingView) {
      return NextResponse.json({ success: true, message: 'Already counted' })
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

    // Record the view
    await supabase
      .from('post_views')
      .insert({
        post_slug: slug,
        post_id: post.id,
        ip_address: ip,
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

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
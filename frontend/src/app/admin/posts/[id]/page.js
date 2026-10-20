import PostEditor from '@/components/admin/PostEditor';
export default async function EditPost({ params }) { const { id } = await params; return <PostEditor id={id} />; }

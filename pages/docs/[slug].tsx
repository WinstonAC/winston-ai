import { GetServerSideProps } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import MarkdownViewer from '@/components/MarkdownViewer';
import Head from 'next/head';
import Link from 'next/link';

interface DocPageProps {
  content: string;
  slug: string;
}

export default function DocPage({ content, slug }: DocPageProps) {
  const title = slug.replace(/_/g, ' ').replace(/.md$/, '');

  return (
    <>
      <Head>
        <title>{title} - Winston AI</title>
      </Head>
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link 
            href="/" 
            className="text-[#32CD32] hover:underline font-mono tracking-wider mb-8 inline-block"
          >
            ← Back to Home
          </Link>
          <MarkdownViewer content={content} />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { slug } = params as { slug: string };
  
  try {
    const filePath = path.join(process.cwd(), 'docs', `${slug}.md`);
    const content = await fs.readFile(filePath, 'utf8');
    
    return {
      props: {
        content,
        slug,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}; 
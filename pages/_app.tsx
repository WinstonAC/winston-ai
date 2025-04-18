import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from '@/components/Layout';
import Chatbot from '../components/Chatbot';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
      <Chatbot />
    </Layout>
  );
}

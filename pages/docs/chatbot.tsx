import React from 'react';
import Head from 'next/head';
import Documentation from '../../components/Documentation';

const ChatbotDocs: React.FC = () => {
  return (
    <>
      <Head>
        <title>Chatbot Documentation - Winston AI</title>
        <meta name="description" content="Documentation for Winston AI's chatbot assistant" />
      </Head>
      <Documentation />
    </>
  );
};

export default ChatbotDocs; 
import React from 'react'
import Editor from './editor'


interface DocumentIdPageProps {
  params: Promise<{ documentId: string }>;
};

const DocumentId = async ({ params }: DocumentIdPageProps) => {
  const { documentId } = await params;

  return (
    <div className='min-h-screen bg-[#FAFBFD]'>
        This is a Doxument Id {documentId}
      <Editor />
    </div>
  )
}

export default DocumentId
import {
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
} from '@tanstack/react-query'
import React, { useState } from 'react'

export function getContext() {
  return {
    queryClient: new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    }),
  }
}

const QueryClientProvider = ({
  children,
  client,
}: {
  children: React.ReactNode
  client: QueryClient
}) => {
  const [queryClient] = useState(() => client)

  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  )
}

export default QueryClientProvider
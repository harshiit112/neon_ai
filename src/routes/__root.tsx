import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { Toaster } from '#/components/ui/toast'
import Navbar from '#/components/navbar'
import QueryClientProvider from '#/integrations/tanstack-query/root-provider'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'neon.ai',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component:RootLayout,
  shellComponent: RootDocument,
  notFoundComponent: RootNotFound,
})

function RootLayout() {
  const { queryClient } = Route.useRouteContext()

  return (
    <QueryClientProvider client={queryClient}>
      <div className='min-h-svh'>
        <Navbar />
        <Outlet />
      </div>
    </QueryClientProvider>
  )
}

function RootNotFound() {
  return (
    <main className="min-h-screen pt-24 px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-semibold">Presentation not found</h1>
        <p className="mt-2 text-muted-foreground">
          The presentation may still be generating or is no longer available.
        </p>
      </div>
    </main>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Scripts />
        <HeadContent />
      </head>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-primary/20">
        {children}
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}

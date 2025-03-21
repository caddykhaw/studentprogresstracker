import { Header, Footer } from '@/lib/AppComponents'

export default function SongsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-13rem)]">
        {children}
      </main>
      <Footer />
    </>
  )
} 
// Next Imports
import { headers } from 'next/headers'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Component Imports
import BuyNowButton from '@components/buy-now-button'

// HOC Imports
import TranslationWrapper from '@/hocs/TranslationWrapper'

// Config Imports
import { i18n } from '@configs/i18n'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
  title: 'TWS Software',
  description: 'TWS Software'
}

const RootLayout = ({ children, params }) => {
  // Vars
  const headersList = headers()
  const direction = i18n.langDirection[params.lang]

  return (
    <TranslationWrapper headersList={headersList} lang={params.lang}>
      <html id='__next' lang={params.lang} dir={direction}>
        <body className='flex is-full min-bs-full flex-auto flex-col'>
          {children}
          {/*<BuyNowButton />*/}
        </body>
      </html>
    </TranslationWrapper>
  )
}

export default RootLayout

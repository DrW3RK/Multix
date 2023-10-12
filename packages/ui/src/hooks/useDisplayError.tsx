import {
  HiOutlineArrowTopRightOnSquare as LaunchIcon,
  HiOutlineExclamationCircle as ErrorOutlineIcon
} from 'react-icons/hi2'

import { styled } from '@mui/material/styles'
import { useAccounts } from '../contexts/AccountsContext'
import { Link } from '../components/library'
import { Center } from '../components/layout/Center'
import { useWatchedAddresses } from '../contexts/WatchedAddressesContext'
import { useMultiProxy } from '../contexts/MultiProxyContext'

export const useDisplayError = () => {
  const { isExtensionError, isAccountLoading } = useAccounts()
  const { watchedAddresses } = useWatchedAddresses()
  const { error: multisigQueryError } = useMultiProxy()

  if (isExtensionError && watchedAddresses.length === 0 && !isAccountLoading) {
    return (
      <CenterStyled>
        <h3 data-cy="text-no-account-found">
          No account found. Please connect at least one in a wallet extension. More info at{' '}
          <Linkstyled
            href="https://wiki.polkadot.network/docs/wallets-and-extensions"
            target="_blank"
            rel="noreferrer"
          >
            wiki.polkadot.network
            <LaunchIcon
              className="launchIcon"
              size={20}
            />
          </Linkstyled>
        </h3>
      </CenterStyled>
    )
  }

  if (multisigQueryError) {
    return (
      <CenterStyled>
        <ErrorMessageStyled>
          <ErrorOutlineIcon size={64} />
          <div>An error occurred.</div>
        </ErrorMessageStyled>
      </CenterStyled>
    )
  }

  return null
}

const Linkstyled = styled(Link)`
  display: inline-flex;
  padding-left: 0.2rem;
  align-items: center;

  .launchIcon {
    margin-left: 0.5rem;
  }
`

const CenterStyled = styled(Center)`
  text-align: center;
`

const ErrorMessageStyled = styled('div')`
  text-align: center;
  margin-top: 1rem;
`

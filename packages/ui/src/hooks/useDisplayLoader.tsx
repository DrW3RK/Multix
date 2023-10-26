import { styled } from '@mui/material/styles'
import { useMultiProxy } from '../contexts/MultiProxyContext'
import { useApi } from '../contexts/ApiContext'
import { Box, CircularProgress } from '@mui/material'
import { useNetwork } from '../contexts/NetworkContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useWatchedAddresses } from '../contexts/WatchedAddressesContext'

export const useDisplayLoader = () => {
  const { isLoading: isLoadingMultisigs } = useMultiProxy()
  const { api } = useApi()
  const { selectedNetworkInfo } = useNetwork()
  const { isAccountLoading, isLocalStorageSetupDone } = useAccounts()
  const { isInitialized: isWatchAddressInitialized } = useWatchedAddresses()

  if (!isWatchAddressInitialized || !isLocalStorageSetupDone) {
    console.log('loader-initialization')
    return (
      <LoaderBoxStyled data-cy="loader-initialization">
        <CircularProgress />
        Initialization...
      </LoaderBoxStyled>
    )
  }

  if (!api) {
    console.log('loader-rpc-connection')
    return (
      <LoaderBoxStyled data-cy="loader-rpc-connection">
        <CircularProgress />
        {`Connecting to the node at ${selectedNetworkInfo?.rpcUrl}`}
      </LoaderBoxStyled>
    )
  }

  if (isAccountLoading) {
    console.log('loader-accounts-connection')
    return (
      <LoaderBoxStyled data-cy="loader-accounts-connection">
        <CircularProgress />
        Loading accounts...
      </LoaderBoxStyled>
    )
  }

  if (isLoadingMultisigs) {
    console.log('loader-multisig')
    return (
      <LoaderBoxStyled data-cy="loader-multisigs">
        <CircularProgress />
        <div>Loading your multisigs...</div>
      </LoaderBoxStyled>
    )
  }

  return null
}

const LoaderBoxStyled = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  padding: 1rem;
`

import { testAccounts } from '../fixtures/testAccounts'
import { landingPageUrl } from '../fixtures/landingData'
import { multisigPage } from '../support/page-objects/multisigPage'
import { txSigningModal } from '../support/page-objects/modals/txSigningModal'
import { knownMultisigs } from '../fixtures/knownMultisigs'

describe('Unknown Transaction', () => {
  beforeEach(() => {
    cy.setupAndVisit({
      url: landingPageUrl,
      extensionConnectionAllowed: true,
      injectExtensionWithAccounts: [testAccounts['Signatory 2 Of Multisig With Unknown Tx']]
    })
  })

  it('can see an unknown transaction displayed in the transaction list', () => {
    multisigPage
      .transactionList()
      .should('be.visible')
      .within(() => {
        multisigPage.pendingTransactionItem().should('have.length', 1)
        multisigPage.pendingTransactionItem().within(() => {
          multisigPage.pendingTransactionCallName().should('contain.text', 'Unknown call')
          multisigPage.unknownCallIcon().should('be.visible')
          multisigPage.unknownCallAlert().should('be.visible')
        })
      })
  })

  it('can see the expected state of an unknown tx without call data', () => {
    const { hashOfUknownCall: expectedCallHash, callData } =
      knownMultisigs['multisig-with-unknown-transaction']

    multisigPage
      .transactionList()
      .should('be.visible')
      .within(() => {
        multisigPage.pendingTransactionItem().within(() => {
          multisigPage.reviewButton().click()
        })
      })
    txSigningModal
      .body()
      .should('be.visible')
      .within(() => {
        txSigningModal.callHashLabel().should('contain.text', expectedCallHash)
        txSigningModal.approveButton().should('not.be.enabled')
        txSigningModal.rejectButton().should('not.exist')
        // now provide call data and ensure we see the call info and approve button enabled
        txSigningModal.callDataInput().type(callData)
        txSigningModal
          .callInfoContainer()
          .should('be.visible')
          .should('contain.text', 'system.remark')
          .should('contain.text', 'remark: Unknown Transaction Test')
        txSigningModal.approveButton().should('be.enabled')
      })
  })
})

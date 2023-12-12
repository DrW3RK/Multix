import { landingPageNetwork } from '../fixtures/landingData'
import { testAccounts } from '../fixtures/testAccounts'
import { accountDisplay } from '../support/page-objects/components/accountDisplay'
import { multisigPage } from '../support/page-objects/multisigPage'
import { newMultisigPage } from '../support/page-objects/newMultisigPage'
import { notifications } from '../support/page-objects/notifications'
import { topMenuItems } from '../support/page-objects/topMenuItems'

const fundedAccount1 = testAccounts['Funded Account 1 Chopsticks Kusama']
const fundedAccount2 = testAccounts['Funded Account 2 Chopsticks Kusama']
const fundedAccount3 = testAccounts['Funded Account 3 Chopsticks Kusama']
const notFundedAccount4 = testAccounts['Not Funded Account 4 Chopsticks Kusama']

const { address: address1 } = fundedAccount1
const { address: address2 } = fundedAccount2
const { address: address3 } = fundedAccount3
const { address: address4 } = notFundedAccount4

const typeAndAdd = (address: string) => {
  newMultisigPage.addressSelector().click().type(`${address}{downArrow}{enter}`)
  newMultisigPage.addButton().click()
}

const acceptMutlisigCreation = () => {
  cy.getTxRequests().then((req) => {
    const txRequests = Object.values(req)
    cy.wrap(txRequests.length).should('eq', 1)
    cy.wrap(txRequests[0].payload.address).should('eq', address1)
    newMultisigPage.nextButton().should('not.exist')
    newMultisigPage.creatingLoader().should('exist')
    cy.approveTx(txRequests[0].id)
    notifications.notificationWrapper(10000).should('have.length', 1)
    notifications.loadingNotificationIcon().should('be.visible')
    notifications.notificationWrapper().should('contain', 'broadcast')

    notifications.successNotificationIcon(30000).should('be.visible')
    notifications.notificationWrapper().should('contain', 'Tx in block')
    const expectedMultisigAddress = 'D9b1mkwhCwyRMUQZLyyKPdVkiJfFCuyVuWr3EmYAV6ETXkX'
    multisigPage.accountHeader(10000).within(() => {
      accountDisplay.addressLabel().should('contain.text', expectedMultisigAddress.slice(0, 6))
    })
  })
}

describe('Multisig creation', () => {
  const randomSignatory1 = 'ECLwZzFusnTr6hdztrkVaTKeQoWxKZBh9e8EzdG92QX7PAy'
  const randomSignatory2 = 'EsNfSu18sXNnbYKn8mshXH3JH5dSDadDFcxrJfVeo4ySmTs'

  beforeEach(() => {
    cy.setupAndVisit({
      url: landingPageNetwork('local'),
      extensionConnectionAllowed: true,
      injectExtensionWithAccounts: [
        fundedAccount1,
        fundedAccount2,
        fundedAccount3,
        notFundedAccount4
      ]
    })
  })

  describe('Multisig creation - Happy path', () => {
    beforeEach(() => {
      topMenuItems.newMultisigButton().click()
      typeAndAdd(address1)
      typeAndAdd(address2)
      typeAndAdd(address3)

      newMultisigPage.nextButton().should('contain', 'Next').click()

      newMultisigPage.step2.thresholdInput().type('2')
      newMultisigPage.step2.nameInput().type('Some Name')
    })

    it('Create a multisig tx with proxy', () => {
      newMultisigPage.nextButton().should('contain', 'Next').click()
      newMultisigPage.nextButton().should('contain', 'Create').click()

      acceptMutlisigCreation()
    })

    it('Create a multisig tx WITHOUT Pure Proxy', () => {
      newMultisigPage.step2.checkboxUsePureProxy().click()
      newMultisigPage.step2.checkboxUsePureProxy().should('not.be.checked')

      newMultisigPage.nextButton().should('contain', 'Next').click()
      newMultisigPage.nextButton().should('contain', 'Create').click()

      acceptMutlisigCreation()
    })
  })

  xdescribe('Multisig creation - step 1', () => {
    beforeEach(() => {
      topMenuItems.newMultisigButton().click()
    })

    xit('Should not allow to click next => when creating a multisig with less than 2 Signatories selected', () => {
      typeAndAdd(address1)

      newMultisigPage.nextButton().should('be.disabled')
    })

    it('Should add signatory with no name given', () => {
      typeAndAdd(randomSignatory1)

      newMultisigPage.step1.accountNameInput().should('have.value', '')
    })

    it('Shows the error message => when signatory address is invalid', () => {
      typeAndAdd(randomSignatory1.slice(0, 10))

      newMultisigPage.step1
        .invalidAddressSelection()
        .should('be.visible')
        .and('contain', 'Invalid address')
    })

    it('should show the warning => when signatories address does NOT belong to your account', () => {
      typeAndAdd(randomSignatory1)
      typeAndAdd(randomSignatory2)

      newMultisigPage.step1
        .createMutlisigError()
        .should('be.visible')
        .and('contain', 'At least one of your own accounts must be a signatory.')
    })
  })

  xdescribe('Multisig creation - step 2', () => {
    beforeEach(() => {
      topMenuItems.newMultisigButton().click()
    })

    xit('Should show the warning => when threshold is too high or low', () => {
      typeAndAdd(address1)
      typeAndAdd(address2)
      newMultisigPage.nextButton().should('contain', 'Next').click()
      const warningMessage = 'Threshold must be between'

      // When is too high
      newMultisigPage.step2.thresholdInput().type('3')
      newMultisigPage.step2.thresholdWarning().should('be.visible').and('contain', warningMessage)
      // When is too low
      newMultisigPage.step2.thresholdInput().type('0')
      newMultisigPage.step2.thresholdWarning().should('be.visible').and('contain', warningMessage)

      // When is valid
      newMultisigPage.step2.thresholdInput().type('2')
      newMultisigPage.step2.thresholdWarning().should('not.exist')
    })

    it('Should show the error => if the funds are not sufficient to create Multisig', () => {
      typeAndAdd(address4)
      typeAndAdd(address1)

      newMultisigPage.nextButton().should('contain', 'Next').click()
      newMultisigPage.step2.thresholdInput().type('2')
      newMultisigPage.nextButton().should('contain', 'Next').click()

      newMultisigPage.addressSelector().click().clear().type(`${address4}{downArrow}{enter}`)

      newMultisigPage.step3
        .errorNotEnoughFunds()
        .should('be.visible')
        .and('contain', "The selected signer doesn't have the required")
      newMultisigPage.nextButton().should('contain', 'Create').and('be.disabled')
    })
  })
})

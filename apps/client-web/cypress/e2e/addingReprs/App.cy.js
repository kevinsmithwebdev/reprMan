/* global cy */
describe('App', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })
  it('should add a repr', () => {
    cy.get('#home-page').should('exist')
    cy.get('#edit-repr-modal').should('not.exist')
    cy.get('.repr-line').should('not.exist')

    cy.get('#add-repr-button').click()
    cy.get('#edit-repr-modal').should('exist')

    cy.get('#edit-repr-title-input').type('My Song')

    cy.get('#edit-repr-save-button').click()
    cy.get('#edit-repr-modal').should('not.exist')
    cy.get('.repr-line-component').should('have.length', 1)
  })
})
